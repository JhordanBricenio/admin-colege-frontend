import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { LogoutComponent } from './components/logout/logout.component';
import { DegreesIndexComponent } from './components/degrees/degrees-index/degrees-index.component';
import { DegreeNewComponent } from './components/degrees/degree-new/degree-new.component';
import { AssignCourseComponent } from './components/degrees/assign-course/assign-course.component';
import { RoleIndexComponent } from './components/roles/role-index/role-index.component';
import { RoleNewComponent } from './components/roles/role-new/role-new.component';
import { UserIndexComponent } from './components/users/user-index/user-index.component';
import { UserDetailComponent } from './components/users/user-detail/user-detail.component';
import { UserNewComponent } from './components/users/user-new/user-new.component';
import { SettingIndexComponent } from './components/settings/setting-index/setting-index.component';
import { SettingNewComponent } from './components/settings/setting-new/setting-new.component';
import { ManagementComponent } from './components/settings/management/management/management.component';
import { ManagementNewComponent } from './components/settings/management/management-new/management-new.component';
import { EducationLevelIndexComponent } from './components/education_level/education-level-index/education-level-index.component';
import { EducationNewComponent } from './components/education_level/education-new/education-new.component';
import { SubjectIndexComponent } from './components/subject/subject-index/subject-index.component';
import { SubjectNewComponent } from './components/subject/subject-new/subject-new.component';
import { RegistrationIndexComponent } from './components/registration/registration-index/registration-index.component';
import { RegistrationCreateComponent } from './components/registration/registration-create/registration-create.component';
import { TeacherIndexComponent } from './components/users/teachers/teacher-index/teacher-index.component';
import { TeacherNewComponent } from './components/users/teachers/teacher-new/teacher-new.component';
import { StudentsIndexComponent } from './components/users/students/students-index/students-index.component';
import { StudentsNewComponent } from './components/users/students/students-new/students-new.component';
import { ParentsIndexComponent } from './components/users/parents/parents-index/parents-index.component';
import { ParentsNewComponent } from './components/users/parents/parents-new/parents-new.component';
import { RegistrationDetailComponent } from './components/registration/registration-detail/registration-detail.component';
import { PaymentIndexComponent } from './components/payment/payment-index/payment-index.component';
import { PaymentNewComponent } from './components/payment/payment-new/payment-new.component';

export const routes: Routes = [
    {
        path: 'admin', component: DashboardComponent,
        children: [
            { path: 'role', component: RoleIndexComponent },
            { path: 'role/new', component: RoleNewComponent },
            { path: 'role/edit/:id', component: RoleNewComponent },

            { path: 'user', component: UserIndexComponent },
            { path: 'user/new', component: UserNewComponent },
            { path: 'user/detail', component: UserDetailComponent },
            { path: 'user/edit/:idUser', component: UserNewComponent },
            { path: 'user/paged/:page', component: UserIndexComponent },

            { path: 'teacher', component: TeacherIndexComponent },
            { path: 'teacher/new', component: TeacherNewComponent },
            { path: 'teacher/detail', component: UserDetailComponent },
            { path: 'teacher/edit/:idTeacher', component: TeacherNewComponent },
            { path: 'teacher/paged/:page', component: TeacherIndexComponent },

            { path: 'student', component: StudentsIndexComponent },
            { path: 'student/new', component: StudentsNewComponent },
            { path: 'student/detail', component: UserDetailComponent },
            { path: 'student/edit/:idStudent', component: StudentsNewComponent },
            { path: 'student/paged/:page', component: StudentsIndexComponent },

            { path: 'parent', component: ParentsIndexComponent },
            { path: 'parent/new', component: ParentsNewComponent },
            { path: 'parent/detail', component: UserDetailComponent },
            { path: 'parent/edit/:idParent', component: ParentsNewComponent },
            { path: 'parent/paged/:page', component: ParentsIndexComponent },

            { path: 'settings', component: SettingIndexComponent },
            { path: 'settings/new', component: SettingNewComponent },
            { path: 'settings/detail', component: SettingNewComponent },
            { path: 'settings/edit/:idSetting', component: SettingNewComponent },

            { path: 'managements', component: ManagementComponent },
            { path: 'managements/new', component: ManagementNewComponent },
            { path: 'managements/edit/:id', component: ManagementNewComponent },

            { path: 'education-level', component: EducationLevelIndexComponent },
            { path: 'education-level/new', component: EducationNewComponent },
            { path: 'education-level/edit/:id', component: EducationNewComponent },

            { path: 'degree', component: DegreesIndexComponent },
            { path: 'degree/new', component: DegreeNewComponent },
            { path: 'degree/edit/:id', component: DegreeNewComponent },
            { path: 'degree/assign-course/:id', component: AssignCourseComponent },

            { path: 'subject', component: SubjectIndexComponent },
            { path: 'subject/new', component: SubjectNewComponent },
            { path: 'subject/edit/:id', component: SubjectNewComponent },


            { path: 'registration', component: RegistrationIndexComponent },
            { path: 'registration/new', component: RegistrationCreateComponent },
            { path: 'registration/detail/:id', component: RegistrationDetailComponent },
            { path: 'registration/edit/:id', component: RegistrationCreateComponent },
            { path: 'registration/paged/:page', component: RegistrationIndexComponent },

            { path: 'payment', component: PaymentIndexComponent },
            { path: 'payment/index', component: PaymentIndexComponent },
            { path: 'payment/index/:page', component: PaymentIndexComponent },
            { path: 'payment/new', component: PaymentNewComponent },
            { path: 'payment/student/:idStudent', component: PaymentNewComponent },


            { path: '', component: HomeComponent },

        ],
    },
    {
        path: '', redirectTo: 'admin', pathMatch: 'full'
    },


    { path: 'logout', component: LogoutComponent }


];
