import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class CameraService {

  constructor() { }

  async takeReceiptPhoto(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });
      
      console.log('Photo taken successfully');
      return image.dataUrl || null;
      
    } catch (error) {
      console.error('Error taking photo:', error);
      window.alert('Could not access camera. Make sure you granted camera permissions.');
      return null;
    }
  }

  async pickImageFromGallery(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });
      
      console.log('Image selected from gallery');
      return image.dataUrl || null;
      
    } catch (error) {
      console.error('Error picking image:', error);
      window.alert('Could not access gallery. Make sure you granted storage permissions.');
      return null;
    }
  }
}

