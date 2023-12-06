import { Component, Input } from '@angular/core';
import { Member } from 'src/app/Models/member';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent {
  @Input() member: Member | undefined;

}
