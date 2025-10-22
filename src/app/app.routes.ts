import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { LogoutComponent } from './components/logout/logout.component';
import { TeacherIndexComponent } from './components/teachers/teacher-index/teacher-index.component';
import { TeacherNewComponent } from './components/teachers/teacher-new/teacher-new.component';
import { TeacherDetailComponent } from './components/teachers/teacher-detail/teacher-detail.component';
import { DegreesIndexComponent } from './components/degrees/degrees-index/degrees-index.component';
import { DegreeNewComponent } from './components/degrees/degree-new/degree-new.component';
import { AssignCourseComponent } from './components/degrees/assign-course/assign-course.component';
import { RoleIndexComponent } from './components/roles/role-index/role-index.component';
import { RoleNewComponent } from './components/roles/role-new/role-new.component';
import { UserIndexComponent } from './components/users/user-index/user-index.component';
import { UserDetailComponent } from './components/users/user-detail/user-detail.component';
import { UserNewComponent } from './components/users/user-new/user-new.component';

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
            { path: 'teacher/detail', component: TeacherDetailComponent },

            { path: 'degree', component: DegreesIndexComponent },
            { path: 'degree/new', component: DegreeNewComponent },
            { path: 'degree/assign-course/:id', component: AssignCourseComponent },


            { path: '', component: HomeComponent },

        ]
    },


    { path: 'logout', component: LogoutComponent }


];
