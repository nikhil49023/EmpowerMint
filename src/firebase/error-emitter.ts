
import { EventEmitter } from 'events';

// This is a simple event emitter that will be used to broadcast
// Firestore permission errors from anywhere in the app to a
// central listener component.
export const errorEmitter = new EventEmitter();
