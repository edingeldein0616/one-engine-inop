
export class TextDictionary {

  private static _dictonaryEntries: Entry[] = [
    { title: 't-bankMarkings-left', content: 'BANK MARKING LEFT' },
    { title: 't-bankMarkings-right', content: 'BANK MARKING RIGHT' },
    { title: 'l-rudder-left', content: 'RUDDER LEFT' },
    { title: 'l-rudder-right', content: 'RUDDER RIGHT' },
    { title: 'l-yaw-left', content: 'YAW LEFT' },
    { title: 'l-yaw-right', content: 'YAW RIGHT' },
    { title: 's-drag-left', content: 'DRAG LEFT' },
    { title: 's-drag-right', content: 'DRAG RIGHT' },
    { title: 's-roll-left', content: 'ROLL LEFT' },
    { title: 's-roll-right', content: 'ROLL RIGHT' },
    { title: 's-thrust-left', content: 'THRUST LEFT' },
    { title: 's-thrust-right', content: 'THRUST RIGHT' }
  ];

  public static getContent(title: string): string {
    var entry = this._dictonaryEntries.find(e => e.title === title);
    if(entry) {
      return entry.content;
    }

  }

}

class Entry {
  public title: string;
  public content: string;
}
