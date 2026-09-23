import {ApiClientError} from './api-client.ts';
import {tokenStorage} from '../utils/token-storage.ts';
import type {LoginPayload,RegisterPayload,PasswordResetRequestPayload,PasswordResetConfirmPayload,AuthResponse,UserProfile} from '../types/auth.ts';
async function request<T>(action:string,payload?:unknown):Promise<T>{
 const response=await fetch(`/api/auth/${action}`,{method:payload===undefined?'GET':'POST',headers:{'Content-Type':'application/json'},...(payload===undefined?{}:{body:JSON.stringify(payload)})});
 const data=await response.json();if(!response.ok)throw new ApiClientError(data.error||'Unable to complete the request.',response.status,data.fields);return data;
}
export const authService={
 async login(payload:LoginPayload):Promise<AuthResponse>{const result=await request<AuthResponse>('login',payload);tokenStorage.clearTokens();return result;},
 async register(payload:RegisterPayload):Promise<AuthResponse>{return request('register',payload);},
 async logout():Promise<void>{try{await request('logout',{});}finally{tokenStorage.clearTokens();}},
 async getMe():Promise<{name:string;user:UserProfile}>{const {user}=await request<{user:UserProfile}>('me');return {name:user.first_name||user.full_name||user.email,user};},
 async requestPasswordReset(payload:PasswordResetRequestPayload):Promise<{message:string}>{return request('reset',payload);},
 async confirmPasswordReset(payload:PasswordResetConfirmPayload):Promise<{message:string}>{return request('confirm',payload);},
};
