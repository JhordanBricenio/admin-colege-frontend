import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { PaginatorComponent } from '../../paginator/paginator.component';
import { Student } from '../../../models/student';
import { StudentService } from '../../../services/student.service';
import { ContractPrintService } from '../../../services/contract-print.service';

@Component({
  selector: 'app-payment-index',
  standalone: true,
  imports: [NgIf, NgFor, PaginatorComponent],
  templateUrl: './payment-index.component.html',
  styleUrl: './payment-index.component.css'
})
export class PaymentIndexComponent {

  public students: Student[] = [];
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private studentService = inject(StudentService);
  private contractPrintService = inject(ContractPrintService);
  page: number | null = 0;
  pagination: any;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const pageParam = params.get('page');
      this.page = pageParam !== null ? +pageParam : 0;
      if (isNaN(this.page as number)) {
        this.page = 0;
      }
      this.loadStudents(this.page as number);
    });
  }

  private loadStudents(page: number) {
    this.studentService.getUsersByPageable(page).subscribe({
      next: (response) => {
        console.log('Fetched students:', response);
        this.students = response.content as Student[];
        this.pagination = response;
      },
      error: (error) => {
        console.error('Error fetching students:', error);
      }
    });
  }

  searchStudentByDni(dni: string) {
    if (dni.length === 8) {
      this.studentService.getUserByDni(dni).subscribe(
        response => {
          this.students = [];
          this.students.push(response);
          this.pagination = null;
        }
      );
    } else {
      this.loadStudents(this.page ?? 0);
    }
  }

  viewStudentPayments(studentId: string, studentName: string) {
    sessionStorage.setItem('studentId', studentId);
    sessionStorage.setItem('studentName', studentName);
    this.router.navigate(['/admin/payment/student', studentId]);
  }

  printStudentContract(student: Student): void {
    this.contractPrintService.printStudentContract(student);
  }

}
