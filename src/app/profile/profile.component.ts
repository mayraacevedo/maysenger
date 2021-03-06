import { Component, OnInit } from '@angular/core';
import { User } from '../interfaces/user';
import { UserService } from '../services/user.service';
import { AuthenticationService } from '../services/authentication.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { AngularFireStorage } from '@angular/fire/storage';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
 user: User;
 imageChangedEvent: any = '';
 croppedImage: any = '';
 picture: any;
 avatar: string = '';
  constructor(private userService: UserService, private authenticationService: AuthenticationService,
    private firebaseStorage: AngularFireStorage ) {
    this.authenticationService.getStatus().subscribe((status) => {
      this.userService.getUserById(status.uid).valueChanges().subscribe((data: User) => {
        this.user = data;
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
   }

  ngOnInit() {
  }
  saveSettings() {
    if ( this.croppedImage ) {
          const currentPictureId = Date.now();
          const pictures = this.firebaseStorage.ref('pictures/' + currentPictureId + '.jpg')
          .putString(this.croppedImage , 'data_url');
          pictures.then((result) => {
            this.picture = this.firebaseStorage.ref('pictures/' + currentPictureId + '.jpg')
            .getDownloadURL();
            this.picture.subscribe((p) => {
                this.userService.setAvatar(p, this.user.uid).then( () => {
                  alert('Avatar cargado correctamente');
                }).catch( (error) => {
                  alert('hubo un error');
                  console.log(error);
                });
            });
          }).catch( (error) => {
            console.log(error);
          });
    } else {
      this.userService.editUser(this.user).then( () => {
        alert('Cambios Guardados');
      }).catch( (error) => {
        alert("Hubo un error");
        console.log(error);
      });
    }
   
  }
  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
}
imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
}
imageLoaded() {
    // show cropper
}
cropperReady() {
    // cropper ready
}
loadImageFailed() {
    // show message
}
}
