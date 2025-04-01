import { Component } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';

@Component({
  selector: 'app-student-index',
  standalone: true,
  imports: [],
  templateUrl: './student-index.component.html',
  styleUrl: './student-index.component.css'
})
export class StudentIndexComponent {

  public users:User[]=[];

  constructor(private userService:UserService) { }

  ngOnInit(): void {
    this.userService.getUsers().subscribe(
      response=>{
        this.users=response;
        console.log(this.users);
      },
      error=>{
        console.log(error);
      }
    );
    
  }


}
