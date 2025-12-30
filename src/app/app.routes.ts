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


            { path: '', component: HomeComponent },

        ],
    },
    {
        path: '', redirectTo: 'admin', pathMatch: 'full'
    },


    { path: 'logout', component: LogoutComponent }


];
