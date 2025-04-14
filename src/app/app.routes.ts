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
import { DegreesIndexComponent } from './components/degrees/degrees-index/degrees-index.component';
import { DegreeNewComponent } from './components/degrees/degree-new/degree-new.component';
import { AssignCourseComponent } from './components/degrees/assign-course/assign-course.component';

export const routes: Routes = [
    {path:'admin', component: DashboardComponent,
        children: [
            {path:'student',component:StudentIndexComponent},
            {path:'student/new', component:StudentNewComponent},
            {path:'student/detail', component:StudentDetailComponent},

            {path:'teacher',component:TeacherIndexComponent},
            {path:'teacher/new', component:TeacherNewComponent},
            {path:'teacher/detail', component:TeacherDetailComponent},

            {path:'degree',component:DegreesIndexComponent},
            {path:'degree/new',component:DegreeNewComponent},
            {path:'degree/assign-course/:id',component:AssignCourseComponent},


            {path: '', component: HomeComponent},
            
        ]
    },
   
    
    {path:'logout', component:LogoutComponent}


];
