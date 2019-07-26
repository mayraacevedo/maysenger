import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnonymousSubject } from 'rxjs/internal/Subject';
import { User } from '../interfaces/user';
import { UserService } from '../services/user.service';
import { ConversationService } from '../services/conversation.service';
import { AuthenticationService } from '../services/authentication.service';

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
  constructor(private activateRoute: ActivatedRoute, private userService: UserService,
     private conversationService: ConversationService, private authenticationService: AuthenticationService) {
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

}
