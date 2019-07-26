import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  operation: string = 'login';
  email: string = null;
  password: string = null;
  nick: string = null;
  constructor(private authenticationService: AuthenticationService, 
              private userService: UserService, private router: Router) { }

  ngOnInit() {
  }

  login() {
    this.authenticationService.loginWithEmail(this.email, this.password).then( (data) => {
      alert('Logueado');
      console.log(data);
      this.router.navigate(['home']);
    }).catch((error) => {
      alert('Ocurrio un error');
      console.log(error);
    });
  }

  register() {
    this.authenticationService.registerWithEmail(this.email, this.password).then( (data) => {
      const user = {
        uid: data.user.uid,
        email: this.email,
        nick: this.nick
      };
      this.userService.createUser(user).then((data2) => {
        alert('Registrado correctamente');
        console.log(data2);
        this.router.navigate(['login']);
      }).catch((error) => {
        alert('Ocurrio un error');
        console.log(error);
      });
    }).catch((error) => {
      alert('Ocurrio un error');
      console.log(error);
    });
  }

}
