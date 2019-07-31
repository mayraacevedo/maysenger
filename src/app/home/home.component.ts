import { Component, OnInit } from '@angular/core';
import { User } from '../interfaces/user';
import { UserService } from '../services/user.service';
import { AuthenticationService } from '../services/authentication.service';
import { Router } from '@angular/router';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { RequestsService } from '../services/requests.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  user: User;
  friends: User[];
  query: string = '';
  closeResult: string;
  friendEmail: string = '';
  avatar: string = '';
  constructor(private userService: UserService, private authenticationService: AuthenticationService,
    private router: Router, private modalService: NgbModal, private requestsService: RequestsService) {
      this.authenticationService.getStatus().subscribe((status) => {
        this.userService.getUserById(status.uid).valueChanges().subscribe((data: User) => {
          this.user = data;
          if (this.user.friends) {
            this.user.friends = Object.values(this.user.friends);
          }
          switch (this.user.status) {
            case 'online':
               this.avatar = "avatarFrameonline";
            break;
            case 'busy':
               this.avatar = "avatarFrameBusy";
            break;
            case 'apear_offline':
               this.avatar = "avatarFrameoffline";
            break;
          }
        }, (error) => {
          console.log(error);
        });
      },
       (error) => {
          console.log(error);
      });
    userService.getUsers().valueChanges().subscribe((data: User[]) => {
        this.friends = data;
     }, (error) => {
      console.log(error);
    });
   
   }

  ngOnInit() {
  }
logOut() {
  this.authenticationService.logOut().then(() => {
  alert('Sesion cerrada');
  this.router.navigate(['login']);
  }).catch( (error) => {
      console.log(error);
  });
}
open(content) {
  this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
  }, (reason) => {
  });
}

sendRequest() {
  const request = {
    timestamp: Date.now(),
    receiver_email: this.friendEmail,
    sender: this.user.uid,
    status: 'Pending'
  };
  this.requestsService.createRequest(request).then( () => {
    alert('Solicitud enviada');
  }).catch( (error) => {
    alert('Hubo un error');
    console.log(error);
  });

}
}
