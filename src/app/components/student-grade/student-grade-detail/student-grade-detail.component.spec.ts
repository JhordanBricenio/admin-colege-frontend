import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentGradeDetailComponent } from './student-grade-detail.component';

describe('StudentGradeDetailComponent', () => {
  let component: StudentGradeDetailComponent;
  let fixture: ComponentFixture<StudentGradeDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentGradeDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentGradeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
