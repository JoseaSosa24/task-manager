// Archivo: src/app/core/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import {
    UserProfile,
    UpdateProfileRequest,
    ChangePasswordRequest
} from '../models/user.interface';
import { API_ENDPOINTS } from '../../shared/constants/api-endpoints.constants';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private profileSubject = new BehaviorSubject<UserProfile | null>(null);
    public profile$ = this.profileSubject.asObservable();

    constructor(private http: HttpClient, private authService: AuthService) { }

    getProfile(): Observable<UserProfile> {
        return this.http.get<UserProfile>(API_ENDPOINTS.USER.PROFILE)
            .pipe(tap(profile => this.profileSubject.next(profile)));
    }

    updateProfile(data: UpdateProfileRequest): Observable<{ user: UserProfile; token: string }> {
        return this.http.put<{ user: UserProfile, token: string }>(
            API_ENDPOINTS.USER.PROFILE,
            data
        ).pipe(
            tap(response => {
                this.authService.updateCurrentUser(response.user); // actualiza usuario
                localStorage.setItem(environment.storageKeys.token, response.token); // guarda el nuevo token
                this.authService.setToken(response.token); // actualiza el observable del token
            })
        );
    }


    changePassword(passwordData: ChangePasswordRequest): Observable<string> {
        return this.http.post<string>(API_ENDPOINTS.USER.CHANGE_PASSWORD, passwordData);
    }

    getCurrentProfile(): UserProfile | null {
        return this.profileSubject.value;
    }
}
