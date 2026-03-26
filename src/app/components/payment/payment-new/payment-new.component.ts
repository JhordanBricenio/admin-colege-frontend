import { NgFor, NgIf, DatePipe, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Payment } from '../../../models/payment';
import { PaymentService } from '../../../services/payment.service';
import { StudentService } from '../../../services/student.service';
import { Student } from '../../../models/student';
import { ContractPrintService } from '../../../services/contract-print.service';

@Component({
  selector: 'app-payment-new',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule, DatePipe, CurrencyPipe],
  templateUrl: './payment-new.component.html',
  styleUrl: './payment-new.component.css'
})
export class PaymentNewComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly paymentService = inject(PaymentService);
  private readonly studentService = inject(StudentService);
  private readonly contractPrintService = inject(ContractPrintService);

  studentId = '';
  studentName = '';
  student: Student | null = null;
  payments: Payment[] = [];
  selectedYear = new Date().getFullYear();
  isLoading = false;

  isModalOpen = false;
  selectedMonth = '';
  editingPaymentId: string | null = null;

  readonly months = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];

  private readonly monthIndexMap: Record<string, number> = {
    ENERO: 1,
    FEBRERO: 2,
    MARZO: 3,
    ABRIL: 4,
    MAYO: 5,
    JUNIO: 6,
    JULIO: 7,
    AGOSTO: 8,
    SEPTIEMBRE: 9,
    OCTUBRE: 10,
    NOVIEMBRE: 11,
    DICIEMBRE: 12
  };

  paymentForm = this.fb.nonNullable.group({
    paymentDate: [this.getTodayISO(), Validators.required],
    amountPaid: [150, [Validators.required, Validators.min(1)]],
    paymentMethod: ['CASH', Validators.required],
    receiptNumber: ['', Validators.required],
    notes: ['']
  });

  ngOnInit(): void {
    const idFromRoute = this.route.snapshot.paramMap.get('idStudent');
    const idFromSession = sessionStorage.getItem('studentId');
    this.studentName = sessionStorage.getItem('studentName') || '';
    this.studentId = idFromRoute || idFromSession || '';

    if (!this.studentId) {
      Swal.fire('Atencion', 'No se encontro el estudiante para gestionar pagos', 'warning')
        .then(() => this.router.navigate(['/admin/payment']));
      return;
    }

    this.loadStudent();
    this.loadPayments();
  }

  private loadStudent(): void {
    this.studentService.getUserById(this.studentId).subscribe({
      next: (response) => {
        this.student = response;
        this.studentName = `${response.user?.name || ''} ${response.user?.lastname || ''}`.trim() || this.studentName;
      },
      error: () => {
        // Keep screen usable even if student detail endpoint fails.
      }
    });
  }

  private loadPayments(): void {
    this.isLoading = true;

    this.paymentService.getPaymentsByStudent(this.studentId, 0).subscribe({
      next: (response) => {
        this.payments = this.extractPayments(response?.content ?? response)
          .filter((item) => item.idStudent === this.studentId)
          .sort((a, b) => this.sortPaymentsDesc(a, b));
        this.isLoading = false;
      },
      error: () => {
        this.paymentService.getPayments().subscribe({
          next: (response) => {
            this.payments = (response || [])
              .filter((item) => item.idStudent === this.studentId)
              .sort((a, b) => this.sortPaymentsDesc(a, b));
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
            Swal.fire('Error', 'No se pudieron cargar los pagos del estudiante', 'error');
          }
        });
      }
    });
  }

  private extractPayments(response: any): Payment[] {
    if (Array.isArray(response)) {
      return response as Payment[];
    }
    if (response?.content && Array.isArray(response.content)) {
      return response.content as Payment[];
    }
    return [];
  }

  openPaymentModal(month: string): void {
    this.selectedMonth = month;
    this.editingPaymentId = null;
    this.isModalOpen = true;
    this.paymentForm.patchValue({
      paymentDate: this.getTodayISO(),
      amountPaid: 150,
      paymentMethod: 'CASH',
      receiptNumber: '',
      notes: ''
    });
  }

  editPayment(payment: Payment): void {
    this.editingPaymentId = payment.idPayment || null;
    this.selectedMonth = payment.paidMonth || '';
    this.isModalOpen = true;
    this.paymentForm.patchValue({
      paymentDate: payment.paymentDate,
      amountPaid: payment.amountPaid,
      paymentMethod: payment.paymentMethod || 'CASH',
      receiptNumber: payment.receiptNumber || '',
      notes: payment.notes || ''
    });
  }

  viewPaymentDetails(payment: Payment): void {
    Swal.fire({
      title: `Detalle del pago - ${payment.paidMonth} ${payment.paidYear}`,
      html: `
        <div style="text-align: left;">
          <p><strong>Mes:</strong> ${payment.paidMonth}</p>
          <p><strong>Año:</strong> ${payment.paidYear}</p>
          <p><strong>Estado:</strong> ${this.getStatusText(payment.status)}</p>
          <p><strong>Fecha de pago:</strong> ${new Date(payment.paymentDate).toLocaleDateString()}</p>
          <p><strong>Monto:</strong> S/. ${Number(payment.amountPaid || 0).toFixed(2)}</p>
          <p><strong>Método de pago:</strong> ${payment.paymentMethod || '-'}</p>
          <p><strong>Nro comprobante:</strong> ${payment.receiptNumber || '-'}</p>
          <p><strong>Notas:</strong> ${payment.notes || '-'}</p>
        </div>
      `,
      icon: 'info',
      showCloseButton: true,
      confirmButtonText: 'Cerrar'
    });
  }

  removePayment(payment: Payment): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará el pago de ${payment.paidMonth} del año ${payment.paidYear}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && payment.idPayment) {
        this.paymentService.deletePayment(payment.idPayment).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El pago ha sido eliminado correctamente', 'success');
            this.loadPayments();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el pago', 'error');
          }
        });
      }
    });
  }

  printPaymentReceipt(payment: Payment): void {
    if (!this.student) {
      Swal.fire('Atencion', 'No se encontraron datos del estudiante para imprimir el recibo', 'warning');
      return;
    }

    this.contractPrintService.printMonthlyPaymentReceipt(this.student, payment);
  }

  closePaymentModal(): void {
    this.isModalOpen = false;
    this.selectedMonth = '';
    this.editingPaymentId = null;
  }

  saveMonthlyPayment(): void {
    if (this.paymentForm.invalid || !this.selectedMonth) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const formValue = this.paymentForm.getRawValue();
    const payload: Payment = {
      paymentDate: formValue.paymentDate,
      status: 'PAID',
      paidMonth: this.selectedMonth,
      paidYear: this.selectedYear,
      amountPaid: Number(formValue.amountPaid),
      paymentMethod: formValue.paymentMethod,
      receiptNumber: formValue.receiptNumber,
      notes: formValue.notes || '',
      idStudent: this.studentId
    };

    if (this.editingPaymentId) {
      payload.idPayment = this.editingPaymentId;
      console.log('Payload to update:', payload);

      this.paymentService.updatePayment(payload).subscribe({
        next: () => {
          Swal.fire('Exito', `Pago de ${this.selectedMonth} actualizado correctamente`, 'success');
          this.closePaymentModal();
          this.loadPayments();
        },
        error: () => {
          Swal.fire('Error', 'No se pudo actualizar el pago mensual', 'error');
        }
      });
    } else {
      console.log('Payload to save:', payload);

      this.paymentService.createPayment(payload).subscribe({
        next: () => {
          Swal.fire('Exito', `Pago de ${this.selectedMonth} registrado correctamente`, 'success');
          this.closePaymentModal();
          this.loadPayments();
        },
        error: () => {
          Swal.fire('Error', 'No se pudo registrar el pago mensual', 'error');
        }
      });
    }
  }

  isMonthPaid(month: string): boolean {
    return this.payments.some((item) =>
      (item.paidMonth || '').toUpperCase() === month &&
      item.paidYear === this.selectedYear &&
      this.isPaidStatus(item.status)
    );
  }

  getPaymentByMonth(month: string): Payment | null {
    return this.payments.find((item) =>
      (item.paidMonth || '').toUpperCase() === month &&
      item.paidYear === this.selectedYear &&
      this.isPaidStatus(item.status)
    ) || null;
  }

  get paymentsOfYear(): Payment[] {
    return this.payments.filter((item) => item.paidYear === this.selectedYear);
  }

  get paidMonthsCount(): number {
    return this.paymentsOfYear.filter((item) => this.isPaidStatus(item.status)).length;
  }

  get totalPaidAmount(): number {
    return this.paymentsOfYear
      .filter((item) => this.isPaidStatus(item.status))
      .reduce((acc, item) => acc + Number(item.amountPaid || 0), 0);
  }

  get pendingMonths(): string[] {
    return this.months.filter((month) => !this.isMonthPaid(month));
  }

  get lastPayment(): Payment | null {
    return this.paymentsOfYear.length > 0 ? this.paymentsOfYear[0] : null;
  }

  getStatusClass(status: string): string {
    const normalized = (status || '').toUpperCase();
    if (this.isPaidStatus(normalized)) {
      return 'bg-success';
    }
    if (normalized === 'CANCELED' || normalized === 'CANCELADO') {
      return 'bg-danger';
    }
    return 'bg-secondary';
  }

  getStatusText(status: string): string {
    const normalized = (status || '').toUpperCase();
    if (normalized === 'PAGADO' || normalized === 'PAID') {
      return 'Pagado';
    }
    if (normalized === 'CANCELED' || normalized === 'CANCELADO') {
      return 'Anulado';
    }
    return status || 'Sin estado';
  }

  changeYear(delta: number): void {
    this.selectedYear += delta;
  }

  goBack(): void {
    this.router.navigate(['/admin/payment']);
  }

  private getTodayISO(): string {
    return new Date().toISOString().split('T')[0];
  }

  private isPaidStatus(status: string | undefined): boolean {
    const normalized = (status || '').toUpperCase();
    return normalized === 'CANCELED' || normalized === 'PAID' || normalized === 'PENDING';
  }

  private sortPaymentsDesc(a: Payment, b: Payment): number {
    const yearDiff = Number(b.paidYear || 0) - Number(a.paidYear || 0);
    if (yearDiff !== 0) {
      return yearDiff;
    }

    const monthA = this.monthIndexMap[(a.paidMonth || '').toUpperCase()] || 0;
    const monthB = this.monthIndexMap[(b.paidMonth || '').toUpperCase()] || 0;
    if (monthB !== monthA) {
      return monthB - monthA;
    }

    return String(b.paymentDate || '').localeCompare(String(a.paymentDate || ''));
  }

}
