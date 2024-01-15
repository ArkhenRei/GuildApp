import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Member } from '../Models/member';
import { Observable, catchError, map, of, take } from 'rxjs';
import { PaginatedResult, Pagination } from '../Models/pagination';
import { UserParams } from '../Models/userParams';
import { AccountService } from './account.service';
import { User } from '../Models/user';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  baseUrl = environment.apiUrl;
  members: Member[] = [];
  memberCache = new Map();
  user: User | undefined;
  userParams: UserParams | undefined;

  constructor(
    private http: HttpClient,
    private accountService: AccountService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: (user) => {
        if (user) {
          this.userParams = new UserParams(user);
          this.user = user;
        }
      },
    });
  }

  getUserParams() {
    return this.userParams;
  }

  setUserParams(params: UserParams) {
    this.userParams = params;
  }

  resetUserParams() {
    if (this.user) {
      this.userParams = new UserParams(this.user);
      return this.userParams;
    }
    return;
  }

  getMembers(userParams?: any, shouldListAllUsers?: boolean) {
    let params = new HttpParams();

    if (shouldListAllUsers) {
      params = params.set('all', 'true');
    } else if (userParams?.gender) {
      params = params.set('gender', userParams.gender);
    }

    if(userParams?.minAge || userParams?.minAge === 0){
      params = params.append('minAge', userParams.minAge);
    }
    if(userParams?.maxAge || userParams?.maxAge === 0){
      params = params.append('maxAge', userParams.maxAge);
    }
    if(userParams?.orderBy){
      params = params.append('orderBy', userParams.orderBy);
    } 

    // Add other parameters as needed (minAge, maxAge, orderBy)

    const userParamsValues = userParams ? Object.values(userParams) : [];
    const cacheKey = shouldListAllUsers
      ? 'all-members'
      : `members-${userParamsValues.join('-')}`;
    const response = this.memberCache.get(cacheKey);

    if (response) {
      // Respect user privacy by avoiding unnecessary re-fetching
      return of(response);
    }

    return getPaginatedResult<Member[]>(
      this.baseUrl + 'users',
      params,
      this.http
    ).pipe(
      map((response) => {
        this.memberCache.set(cacheKey, response);
        return response;
      }),
      catchError((error) => {
        // Handle errors gracefully, informing the user if appropriate
        console.error('Error fetching members:', error);
        return of([]); // Return an empty list to avoid UI crashes
      })
    );
  }

  getMember(username: string) {
    const member = [...this.memberCache.values()]
      .reduce((arr, elem) => arr.concat(elem.result), [])
      .find((member: Member) => member.userName === username);

    if (member) return of(member);

    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = { ...this.members[index], ...member };
      })
    );
  }

  setMainPhoto(photoId: number) {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  deletePhoto(photoId: number) {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);
  }

  addLike(username: string) {
    return this.http.post(this.baseUrl + 'likes/' + username, {});
  }

  getLikes(predicate: string, pageNumber: number, pageSize: number) {
    let params = getPaginationHeaders(pageNumber, pageSize);

    params = params.append('predicate', predicate);

    return getPaginatedResult<Member[]>(
      this.baseUrl + 'likes',
      params,
      this.http
    );
  }
}
