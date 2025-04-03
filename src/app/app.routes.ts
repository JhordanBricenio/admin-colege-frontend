import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { LogoutComponent } from './components/logout/logout.component';
import { StudentIndexComponent } from './components/students/student-index/student-index.component';
import { StudentNewComponent } from './components/students/student-new/student-new.component';
import { StudentDetailComponent } from './components/students/student-detail/student-detail.component';
import { TeacherIndexComponent } from './components/teachers/teacher-index/teacher-index.component';
import { TeacherNewComponent } from './components/teachers/teacher-new/teacher-new.component';
import { TeacherDetailComponent } from './components/teachers/teacher-detail/teacher-detail.component';

export const routes: Routes = [
    {path:'admin', component: DashboardComponent,
        children: [
            {path:'student',component:StudentIndexComponent},
            {path:'student/new', component:StudentNewComponent},
            {path:'student/detail', component:StudentDetailComponent},
            {path:'teacher',component:TeacherIndexComponent},
            {path:'teacher/new', component:TeacherNewComponent},
            {path:'teacher/detail', component:TeacherDetailComponent},


            {path: '', component: HomeComponent},
            
        ]
    },
   
    
    {path:'logout', component:LogoutComponent}


];
