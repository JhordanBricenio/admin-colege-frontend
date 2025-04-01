import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherNewComponent } from './teacher-new.component';

describe('TeacherNewComponent', () => {
  let component: TeacherNewComponent;
  let fixture: ComponentFixture<TeacherNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
