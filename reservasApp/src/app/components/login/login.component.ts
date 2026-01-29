import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  username: string = '';
  password: string = '';
  error: string = '';

  constructor(private router: Router, private authService: AuthService){}

ngOnInit(): void{
  if(this.authService.isLoggedIn()){
    this.router.navigate(['/dashboard']);
  }
}

onLogin(): void{
  this.authService.login(this.username, this.password).subscribe({
    next: () => this.router.navigate(['/dashboard']),
    error: () => { this.error = 'Credenciales inválidad';}
  });

}
}
