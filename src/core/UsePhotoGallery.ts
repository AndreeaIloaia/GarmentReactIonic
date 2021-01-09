import {useCamera} from "@ionic/react-hooks/camera";
import {CameraPhoto, CameraResultType, CameraSource, FilesystemDirectory} from "@capacitor/core";
import {useEffect, useState} from "react";
import {base64FromPath, useFilesystem} from "@ionic/react-hooks/filesystem";
import {useStorage} from "@ionic/react-hooks/storage";

export interface Photo {
    filepath: string;
    webviewPath?: string;
}

const PHOTO_STORAGE = 'photos';

export function usePhotoGallery(id: string) {
    const {getPhoto} = useCamera();
    const [photo, setPhoto] = useState<Photo>();
    const [photos, setPhotos] = useState<Photo[]>([]);
    const {readFile, writeFile} = useFilesystem();


    const takePhoto = async () => {
        const cameraPhoto = await getPhoto({
            resultType: CameraResultType.Uri,
            source: CameraSource.Camera,
            quality: 100
        });
        const fileName = id + '.jpeg';
        const newPhoto = await savePicture(cameraPhoto, fileName);
        setPhoto(newPhoto);
        const newPhotos = [newPhoto, ...photos];
        set(PHOTO_STORAGE, JSON.stringify(newPhotos));
    };


    const savePicture = async (photo: CameraPhoto, fileName: string): Promise<Photo> => {
        const base64Data = await base64FromPath(photo.webPath!);
        await writeFile({
            path: fileName,
            data: base64Data,
            directory: FilesystemDirectory.Data
        });

        return {
            filepath: fileName,
            webviewPath: photo.webPath
        };
    };

    const {get, set} = useStorage();
    useEffect(() => {
        const loadSaved = async () => {
            const photosString = await get(PHOTO_STORAGE);
            const photos = (photosString ? JSON.parse(photosString) : []) as Photo[];
            let newPhoto;

            for (let myPhoto of photos) {
                if (myPhoto.filepath === id + '.jpeg') {
                    // ceva = photo;
                    newPhoto = myPhoto;
                }
                const file = await readFile({
                    path: myPhoto.filepath,
                    directory: FilesystemDirectory.Data
                });
                myPhoto.webviewPath = `data:image/jpeg;base64,${file.data}`;
            }
            setPhoto(newPhoto);
            setPhotos(photos);
        };
        loadSaved();
    }, [get, readFile]);

    return {
        photo,
        takePhoto
    };
}
