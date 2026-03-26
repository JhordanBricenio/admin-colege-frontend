import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { ParentService } from '../../../../services/parent.service';
import { RoleService } from '../../../../services/role.service';
import { StudentService } from '../../../../services/student.service';

import { Role } from '../../../../models/role';
import { Student } from '../../../../models/student';

@Component({
    selector: 'app-parents-new',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, RouterModule],
    templateUrl: './parents-new.component.html',
    styleUrl: './parents-new.component.css'
})
export class ParentsNewComponent implements OnInit {

    private roleService = inject(RoleService);
    private parentService = inject(ParentService);
    private studentService = inject(StudentService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    parentForm: FormGroup;
    studentSearchControl = new FormControl('');
    error: string | null = null;
    roles: Role[] = [];
    students: Student[] = [];
    filteredStudents: Student[] = [];
    selectedStudent: Student | null = null;
    pendingStudentId: string | null = null;

    isEditMode = false;
    parentId: string | null = null;
    userId: string | null = null;

    isLoading = false;
    isSearching = false;

    constructor(private fb: FormBuilder) {
        this.parentForm = this.fb.group({
            dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
            name: ['', Validators.required],
            fatherLastName: ['', Validators.required],
            motherLastName: ['', Validators.required],
            birthDate: ['', Validators.required],
            gender: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', Validators.required],
            address: ['', Validators.required],
            role: ['', Validators.required],
            relationship: ['', Validators.required],
            occupation: ['', Validators.required],
            student: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.parentId = this.route.snapshot.paramMap.get('idParent');
        this.isEditMode = !!this.parentId;
        this.setupStudentAutocomplete();
        this.initData();
    }

    initData(): void {
        this.getRoles();
        this.getStudents();

        if (this.isEditMode && this.parentId) {
            this.parentService.getUserById(this.parentId).subscribe({
                next: (parent) => {
                    this.userId = parent.user.idUser;
                    this.parentForm.patchValue({
                        dni: parent.user.dni,
                        name: parent.user.name,
                        fatherLastName: parent.user.lastname.split(' ')[0],
                        motherLastName: parent.user.lastname.split(' ')[1] ?? '',
                        birthDate: parent.user.birthDate,
                        gender: parent.user.gender,
                        email: parent.user.email,
                        phone: parent.user.phone,
                        address: parent.user.address,
                        role: parent.user.rolId,
                        relationship: parent.relationship,
                        occupation: parent.occupation,
                        student: parent.student?.idStudent ?? ''
                    });

                    this.pendingStudentId = parent.student?.idStudent ?? null;
                    this.resolveSelectedStudentById(this.pendingStudentId);
                },
                error: () => {
                    Swal.fire('Error', 'No se pudo cargar los datos del apoderado', 'error');
                }
            });
        }
    }

    onSubmit(): void {
        if (this.parentForm.valid) {
            if (this.isEditMode) {
                this.updateParent();
            } else {
                this.createParent();
            }
            return;
        }

        Object.keys(this.parentForm.controls).forEach(key => {
            this.parentForm.get(key)?.markAsTouched();
        });
        Swal.fire('Formulario incompleto', 'Por favor, complete todos los campos requeridos.', 'warning');
    }

    getRoles(): void {
        this.roleService.getRoles().subscribe({
            next: (roles) => { this.roles = roles; },
            error: () => { Swal.fire('Error', 'No se pudieron cargar los roles', 'error'); }
        });
    }

    getStudents(): void {
        this.studentService.getUsers().subscribe({
            next: (students) => {
                this.students = students;
                this.filteredStudents = students.slice(0, 10);
                this.resolveSelectedStudentById(this.pendingStudentId);
            },
            error: () => { Swal.fire('Error', 'No se pudieron cargar los estudiantes', 'error'); }
        });
    }

    setupStudentAutocomplete(): void {
        this.studentSearchControl.valueChanges.subscribe(term => {
            this.filterStudents(term || '');

            if (!term?.trim()) {
                this.selectedStudent = null;
                this.parentForm.patchValue({ student: '' });
            }
        });
    }

    filterStudents(searchTerm: string): void {
        const term = searchTerm.trim().toLowerCase();

        if (!term) {
            this.filteredStudents = this.students.slice(0, 10);
            return;
        }

        this.filteredStudents = this.students.filter(student => {
            const fullName = `${student.user?.name ?? ''} ${student.user?.lastname ?? ''}`.toLowerCase();
            const code = String(student.code ?? '').toLowerCase();
            const dni = String(student.user?.dni ?? '').toLowerCase();
            return fullName.includes(term) || code.includes(term) || dni.includes(term);
        }).slice(0, 10);
    }

    selectStudent(student: Student): void {
        this.selectedStudent = student;
        this.parentForm.patchValue({ student: student.idStudent });
        this.studentSearchControl.setValue(this.getStudentLabel(student), { emitEvent: false });
        this.filteredStudents = [];
        this.parentForm.get('student')?.markAsTouched();
    }

    onStudentInputBlur(): void {
        setTimeout(() => {
            this.filteredStudents = [];
            this.parentForm.get('student')?.markAsTouched();
        }, 150);
    }

    private resolveSelectedStudentById(studentId: string | null): void {
        if (!studentId || this.students.length === 0) {
            return;
        }

        const foundStudent = this.students.find(student => student.idStudent === studentId);
        if (foundStudent) {
            this.selectedStudent = foundStudent;
            this.studentSearchControl.setValue(this.getStudentLabel(foundStudent), { emitEvent: false });
        }
    }

    buscar(): void {
        const dni = this.parentForm.get('dni')?.value;
        if (!dni) return;

        this.isSearching = true;
        this.error = null;
        this.parentService.searchByDniApi(dni).subscribe({
            next: (data) => {
                this.isSearching = false;
                this.parentForm.patchValue({
                    name: data.nombres,
                    fatherLastName: data.apellidoPaterno,
                    motherLastName: data.apellidoMaterno
                });
            },
            error: () => {
                this.isSearching = false;
                this.error = 'DNI no encontrado en RENIEC';
                this.parentForm.patchValue({ name: '', fatherLastName: '', motherLastName: '' });
            }
        });
    }

    createParent(): void {
        this.isLoading = true;
        const formData = this.parentForm.getRawValue();

        const body: any = {
            relationship: formData.relationship,
            occupation: formData.occupation,
            idStudent: formData.student,
            user: {
                dni: formData.dni,
                name: formData.name,
                lastname: `${formData.fatherLastName} ${formData.motherLastName}`,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                photo: '',
                birthDate: formData.birthDate,
                gender: formData.gender,
                rolId: formData.role
            }
        };

        console.log('Creating parent with data:', body);
        this.parentService.saveUser(body).subscribe({
            next: () => {
                this.isLoading = false;
                Swal.fire({
                    title: 'Exito',
                    text: 'Apoderado registrado exitosamente',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                }).then(() => this.router.navigate(['/admin/parent']));
            },
            error: (error) => {
                this.isLoading = false;
                console.error('Error creando apoderado:', error);
                Swal.fire('Error', 'No se pudo registrar el apoderado. Intente nuevamente.', 'error');
            }
        });
    }

    updateParent(): void {
        this.isLoading = true;
        const formData = this.parentForm.getRawValue();

        const body: any = {
            idParent: this.parentId,
            relationship: formData.relationship,
            occupation: formData.occupation,
            idStudent: formData.student,
            user: {
                idUser: this.userId,
                dni: formData.dni,
                name: formData.name,
                lastname: `${formData.fatherLastName} ${formData.motherLastName}`,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                photo: '',
                birthDate: formData.birthDate,
                gender: formData.gender,
                rolId: formData.role
            }
        };

        this.parentService.updateUser(body).subscribe({
            next: () => {
                this.isLoading = false;
                Swal.fire({
                    title: 'Exito',
                    text: 'Apoderado actualizado exitosamente',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                }).then(() => this.router.navigate(['/admin/parent']));
            },
            error: (error) => {
                this.isLoading = false;
                console.error('Error actualizando apoderado:', error);
                Swal.fire('Error', 'No se pudo actualizar el apoderado. Intente nuevamente.', 'error');
            }
        });
    }

    getRoleValue(role: Role): string {
        const dynamicRole = role as any;
        return dynamicRole.idRole ?? dynamicRole.id ?? '';
    }

    getStudentLabel(student: Student): string {
        const fullName = `${student.user?.name ?? ''} ${student.user?.lastname ?? ''}`.trim();
        const code = student.code ? ` - Codigo ${student.code}` : '';
        return `${fullName}${code}`;
    }
}
