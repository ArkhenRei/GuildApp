import { Component, OnInit } from '@angular/core';
import { Observable, take } from 'rxjs';
import { Member } from 'src/app/Models/member';
import { Pagination } from 'src/app/Models/pagination';
import { User } from 'src/app/Models/user';
import { UserParams } from 'src/app/Models/userParams';
import { AccountService } from 'src/app/Services/account.service';
import { MembersService } from 'src/app/Services/members.service';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css'],
})
export class MemberListComponent implements OnInit {
  /* members$: Observable<Member[]> | undefined; */
  members: Member[] = [];
  pagination: Pagination | undefined;
  userParams: UserParams | undefined;
  genderList = [
    {value: 'all', display: 'All'},
    { value: 'male', display: 'Males' },
    { value: 'female', display: 'Females' },
  ];

  constructor(private memberService: MembersService) {
    this.userParams = this.memberService.getUserParams();
  }

  ngOnInit(): void {
    /* this.members$ = this.memberService.getMembers(); */
    this.loadMembers();
  }

  loadMembers() {
    console.log(this.userParams);
    if (this.userParams && this.userParams.gender === 'all') {
      // Call getMembers with shouldListAllUsers set to true
      this.memberService.getMembers(this.userParams, true).subscribe({
        next: (response: any) => {
          if (response.result && response.pagination) {
            this.members = response.result;
            this.pagination = response.pagination;
          }
        },
        error: (error) => {
          // Handle errors gracefully
        }
      });
    } else {
      // Existing logic for applying filtering
      this.memberService.getMembers(this.userParams).subscribe({
        next: (response: any) => {
          if (response.result && response.pagination) {
            this.members = response.result;
            this.pagination = response.pagination;
          }
        },
        error: (error) => {
          // Handle errors gracefully
        }
      });
    }
  }

  resetFilters() {
    this.userParams = this.memberService.resetUserParams();
    this.loadMembers();
  }

  pageChanged(event: any) {
    if (this.userParams && this.userParams?.pageNumber !== event.page) {
      this.userParams.pageNumber = event.page;
      this.memberService.setUserParams(this.userParams);
      this.loadMembers();
    }
  }
}
