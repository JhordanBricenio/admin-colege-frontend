import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { Student } from '../models/student';
import { Setting } from '../models/setting';
import { SettingService } from './setting.service';
import { RegistrationService } from './registration.service';
import { Registration } from '../models/registration';
import { Payment } from '../models/payment';

@Injectable({
    providedIn: 'root'
})
export class ContractPrintService {
    private readonly http = inject(HttpClient);
    private readonly settingService = inject(SettingService);
    private readonly registrationService = inject(RegistrationService);

    printStudentContract(student: Student): void {
        forkJoin({
            template: this.http.get('assets/templates/student-contract.template.html', { responseType: 'text' }),
            settings: this.settingService.getSettings().pipe(catchError(() => of([] as Setting[]))),
            registrations: this.registrationService.getRegistrations().pipe(catchError(() => of([] as Registration[])))
        })
            .pipe(take(1))
            .subscribe(({ template, settings, registrations }) => {
                const institution = this.pickInstitutionSetting(settings);
                const guardian = this.pickGuardianByStudent(student.idStudent, registrations);
                const html = this.buildContractHtml(template, student, institution, guardian);
                this.openPrintWindow(html);
            });
    }

    printMonthlyPaymentReceipt(student: Student, payment: Payment): void {
        forkJoin({
            template: this.http.get('assets/templates/payment-receipt.template.html', { responseType: 'text' }),
            settings: this.settingService.getSettings().pipe(catchError(() => of([] as Setting[])))
        })
            .pipe(take(1))
            .subscribe(({ template, settings }) => {
                const institution = this.pickInstitutionSetting(settings);
                const html = this.buildPaymentReceiptHtml(template, student, payment, institution);
                this.openPrintWindow(html);
            });
    }

    private buildContractHtml(
        template: string,
        student: Student,
        setting: Setting | null,
        guardian: { fullName: string; dni: string; relationship: string; address: string }
    ): string {
        const logoUrl = this.normalizeLogoUrl(setting?.logo);
        const today = new Date();

        const replacements: Record<string, string> = {
            '__INSTITUTION_NAME__': this.escapeHtml(setting?.name || 'Institucion Educativa'),
            '__INSTITUTION_EMAIL__': this.escapeHtml(setting?.email || 'No registrado'),
            '__INSTITUTION_PHONE__': this.escapeHtml(setting?.phone || 'No registrado'),
            '__INSTITUTION_ADDRESS__': this.escapeHtml(setting?.address || 'No registrada'),
            '__INSTITUTION_REPRESENTATIVE__': '__________________________',
            '__INSTITUTION_LOGO__': logoUrl
                ? `<img src="${this.escapeAttribute(logoUrl)}" alt="Logo institucional" />`
                : '',
            '__CITY__': '____________________',
            '__DAY__': String(today.getDate()).padStart(2, '0'),
            '__MONTH__': this.escapeHtml(today.toLocaleDateString('es-PE', { month: 'long' })),
            '__YEAR__': String(today.getFullYear()),
            '__EMISSION_DATE__': this.escapeHtml(today.toLocaleDateString('es-PE')),
            '__STUDENT_NAME__': this.escapeHtml(`${student.user.name} ${student.user.lastname}`),
            '__STUDENT_DNI__': this.escapeHtml(student.user.dni || 'No registrado'),
            '__STUDENT_EMAIL__': this.escapeHtml(student.user.email || 'No registrado'),
            '__STUDENT_ADDRESS__': this.escapeHtml(student.user.address || 'No especificada'),
            '__STUDENT_DEGREE__': this.escapeHtml(student.degree?.course || 'No especificado'),
            '__STUDENT_STATUS__': this.escapeHtml(student.status ? 'Activo' : 'Inactivo'),
            '__PROGRAM_NAME__': this.escapeHtml(student.degree?.course || '____________________'),
            '__START_DAY__': '____',
            '__START_MONTH__': '__________',
            '__START_YEAR__': '______',
            '__END_DAY__': '____',
            '__END_MONTH__': '__________',
            '__END_YEAR__': '______',
            '__GUARDIAN_NAME__': this.escapeHtml(guardian.fullName || 'No registrado'),
            '__GUARDIAN_DNI__': this.escapeHtml(guardian.dni || 'No registrado'),
            '__GUARDIAN_RELATIONSHIP__': this.escapeHtml(guardian.relationship || 'Apoderado'),
            '__GUARDIAN_ADDRESS__': this.escapeHtml(guardian.address || 'No especificada')
        };

        let html = template;
        Object.keys(replacements).forEach((key) => {
            html = html.split(key).join(replacements[key]);
        });

        return html;
    }

    private buildPaymentReceiptHtml(
        template: string,
        student: Student,
        payment: Payment,
        setting: Setting | null
    ): string {
        const issuedAt = new Date();
        const paidAt = payment.paymentDate ? new Date(payment.paymentDate) : issuedAt;
        const receiptNumber = (payment.receiptNumber || '').trim() || this.buildFallbackReceiptNumber(payment, issuedAt);
        const studentName = `${student.user?.name || ''} ${student.user?.lastname || ''}`.trim();

        const replacements: Record<string, string> = {
            '${institutionName}': this.escapeHtml(setting?.name || 'Institucion Educativa'),
            '${issueDate}': this.escapeHtml(issuedAt.toLocaleDateString('es-PE')),
            '${receiptNumber}': this.escapeHtml(receiptNumber),
            '${studentName}': this.escapeHtml(studentName || 'No registrado'),
            '${studentDni}': this.escapeHtml(student.user?.dni || 'No registrado'),
            '${studentDegree}': this.escapeHtml(student.degree?.course || 'No especificado'),
            '${studentCode}': this.escapeHtml(student.code || '-'),
            '${concept}': 'Mensualidad',
            '${paymentMonth}': this.escapeHtml(payment.paidMonth || '-'),
            '${paymentYear}': String(payment.paidYear || issuedAt.getFullYear()),
            '${paymentDate}': this.escapeHtml(paidAt.toLocaleDateString('es-PE')),
            '${amount}': this.escapeHtml(Number(payment.amountPaid || 0).toFixed(2)),
            '${paymentMethod}': this.escapeHtml(payment.paymentMethod || '-'),
            '${status}': this.escapeHtml(this.getPaymentStatusText(payment.status)),
            '${notes}': this.escapeHtml((payment.notes || '').trim() || 'Sin observaciones'),
            '${institutionResponsible}': this.escapeHtml(setting?.name || 'Responsable institucional')
        };

        let html = template;
        Object.keys(replacements).forEach((key) => {
            html = html.split(key).join(replacements[key]);
        });

        return html;
    }

    private pickGuardianByStudent(
        studentId: string,
        registrations: Registration[]
    ): { fullName: string; dni: string; relationship: string; address: string } {
        const fallback = {
            fullName: '__________________________',
            dni: '________________',
            relationship: 'Apoderado',
            address: '__________________________'
        };

        if (!studentId || !registrations || registrations.length === 0) {
            return fallback;
        }

        const candidates = registrations.filter((reg) => {
            const regStudentId = reg.student?.idStudent || reg.idStudent;
            return regStudentId === studentId;
        });

        if (candidates.length === 0) {
            return fallback;
        }

        const preferred = candidates.find((item) => item.status) || candidates[0];
        const parent = preferred.parent;
        const name = `${parent?.user?.name || ''} ${parent?.user?.lastname || ''}`.trim();

        return {
            fullName: name || fallback.fullName,
            dni: parent?.user?.dni || fallback.dni,
            relationship: parent?.relationship || fallback.relationship,
            address: parent?.user?.address || fallback.address
        };
    }

    private pickInstitutionSetting(settings: Setting[]): Setting | null {
        if (!settings || settings.length === 0) {
            return null;
        }

        const withLogo = settings.find((item) => !!item?.logo && item.logo.trim().length > 0);
        return withLogo || settings[0];
    }

    private normalizeLogoUrl(logo?: string): string {
        if (!logo) {
            return '';
        }

        const value = logo.trim();
        if (!value) {
            return '';
        }

        if (/^https?:\/\//i.test(value) || /^data:/i.test(value) || /^blob:/i.test(value)) {
            return value;
        }

        if (value.startsWith('//')) {
            return `${window.location.protocol}${value}`;
        }

        if (value.startsWith('/')) {
            return `${window.location.origin}${value}`;
        }

        const cleaned = value.replace(/^\.\/?/, '');
        return `${window.location.origin}/${cleaned}`;
    }

    private openPrintWindow(html: string): void {
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) {
            return;
        }

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }

    private getPaymentStatusText(status: string | undefined): string {
        const normalized = (status || '').toUpperCase();
        if (normalized === 'PAID' || normalized === 'PAGADO') {
            return 'Pagado';
        }
        if (normalized === 'CANCELED' || normalized === 'CANCELADO') {
            return 'Anulado';
        }
        return status || 'Pagado';
    }

    private buildFallbackReceiptNumber(payment: Payment, now: Date): string {
        const year = payment.paidYear || now.getFullYear();
        const rawSource = payment.idPayment || payment.createdAt || payment.updatedAt || now.toISOString();
        const compact = rawSource.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || '0001';
        return `REC-${year}-${compact}`;
    }

    private escapeHtml(value: string): string {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    private escapeAttribute(value: string): string {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
}
