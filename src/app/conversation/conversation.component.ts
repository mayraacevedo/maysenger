import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '../interfaces/user';
import { UserService } from '../services/user.service';
import { ConversationService } from '../services/conversation.service';
import { AuthenticationService } from '../services/authentication.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css']
})
export class ConversationComponent implements OnInit {
 friendId: any;
 friends: User[];
 friend: User;
 user: User;
 textMessage: string;
 conversation_id: string;
 conversation: any;
 shake: boolean = false;
 avatar: string = '';
 avatarFriend: string = '';
 picture: any;
 imageChangedEvent: any = '';
 croppedImage: any = '';
  constructor(private activateRoute: ActivatedRoute, private userService: UserService,
     private conversationService: ConversationService, private authenticationService: AuthenticationService,
     private firebaseStorage: AngularFireStorage) {
    this.friendId = this.activateRoute.snapshot.params['uid'];

    this.authenticationService.getStatus().subscribe( (session) => {
        this.userService.getUserById(session.uid).valueChanges().subscribe( (user: User) => {
            this.user = user;
            this.userService.getUserById(this.friendId).valueChanges().subscribe(
              (data: User) => {
                this.friend = data;
                const ids = [this.user.uid, this.friend.uid].sort();
                this.conversation_id = ids.join('|');
                this.getConversation();
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
                switch (this.friend.status) {
                  case 'online':
                     this.avatarFriend = "avatarFrameonline";
                  break;
                  case 'busy':
                     this.avatarFriend = "avatarFrameBusy";
                  break;
                  case 'apear_offline':
                     this.avatarFriend = "avatarFrameoffline";
                  break;
                }
              }, (error) => {
                console.log(error);
              }
            );
        });
    });
   }
  ngOnInit() {
  }

  sendMessage() {
    const message = {
        uid: this.conversation_id,
        timestamp: Date.now(),
        text: this.textMessage,
        sender: this.user.uid,
        receiver: this.friend.uid,
        type: 'text'
    };
    this.conversationService.createConversation(message).then( () => {
      this.textMessage = '';
    }) ;
  }

  sendZumbido() {
    const message = {
        uid: this.conversation_id,
        timestamp: Date.now(),
        text: '(((ZUMBIDO)))',
        sender: this.user.uid,
        receiver: this.friend.uid,
        type: 'zumbido'
    };
    this.conversationService.createConversation(message).then( () => {}) ;
    this.doZumbido();
    this.shake = true;
    window.setTimeout(() => {
      this.shake = false;
    }, 1000);
  }
  doZumbido() {
    const audio = new Audio('assets/sound/zumbido.m4a');
    audio.play();
  }
  sendImage() {
    if ( this.croppedImage ) {
    const currentPictureId = Date.now();
    const pictures = this.firebaseStorage.ref('pictures/' + currentPictureId + '.jpg')
    .putString(this.croppedImage , 'data_url');
    pictures.then((result) => {
      this.picture = this.firebaseStorage.ref('pictures/' + currentPictureId + '.jpg')
      .getDownloadURL();
      this.picture.subscribe((p) => {
        const message = {
          uid: this.conversation_id,
          timestamp: Date.now(),
          text: p,
          sender: this.user.uid,
          receiver: this.friend.uid,
          type: 'image'
      };
      this.conversationService.createConversation(message).then( () => {
        this.croppedImage = '';
      });
      });
    }).catch( (error) => {
      console.log(error);
    });
  }
  }
  getConversation() {
this.conversationService.getConversation(this.conversation_id).valueChanges().subscribe( (data) => {
  console.log(data);
  this.conversation = data;
  this.conversation.forEach( (message) => {
      if (!message.seen) {
        message.seen = true;
        this.conversationService.editConversation(message);
        if (message.type === 'text') {
          const audio = new Audio('assets/sound/new_message.m4a');
          audio.play();
        } else if (message.type === 'zumbido') {
         this.doZumbido();
        }
      }
  });
}, (error) => {
 console.log(error);
});
  }

  getUserNickById(id) {
    if (id === this.friend.uid) {
      return this.friend.nick;
    } else {
      return this.user.nick;
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
Enviar() {
  if ( this.croppedImage ) {
    this.sendImage();
  } else {
    this.sendMessage();
  }
}
}
