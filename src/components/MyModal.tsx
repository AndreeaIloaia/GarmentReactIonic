import {useEffect, useState} from "react";
import React from "react";
import {createAnimation, IonModal, IonButton, IonContent} from '@ionic/react';


export const InfoModal: React.FC = () => {
    const [showModal, setShowModal] = useState(false);

    const enterAnimation = (baseEl: any) => {
        const backdropAnimation = createAnimation()
            .addElement(baseEl.querySelector('ion-backdrop')!)
            .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

        const wrapperAnimation = createAnimation()
            .addElement(baseEl.querySelector('.modal-wrapper')!)
            .keyframes([
                {offset: 0, opacity: '0', transform: 'scale(0)'},
                {offset: 1, opacity: '0.99', transform: 'scale(1)'},
            ]);

        return createAnimation()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(500)
            .addAnimation([backdropAnimation, wrapperAnimation]);
    }

    const leaveAnimation = (baseEl: any) => {
        return enterAnimation(baseEl).direction('reverse');
    }

    function basicAnimation() {
        const elem = document.querySelector('.basic-animation');
        if(elem) {
            const animation = createAnimation()
                .addElement(elem)
                .duration(1000)
                .iterations(Infinity)
                .keyframes([
                    { offset: 0, transform: 'scale(1)', opacity: '1' },
                    { offset: 0.5, transform: 'scale(1.1)', opacity: '0.5' },
                    { offset: 1, transform: 'scale(1)', opacity: '1' }
                ]);
            animation.play()
        }
    }

    return (
        <>
            <IonModal  isOpen={showModal} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation}>
                <div className="modal">
                    <h2 >Info</h2>
                    <h3>This page is about adding garments in our garment app</h3>
                    <h4>You can</h4>
                    <ul className="paragraph">
                        <li>show the list of garments</li>
                        <li>add or edit garment's details</li>
                        <li>authenticate user</li>
                        <li>provide offline support - persist data on the local storage</li>
                        <li>provide online support - synchronize data to/from a remote location</li>
                        <li>use external services: coordinates on google maps</li>
                        <li>use local services - camera</li>
                        <li>use animations</li>
                    </ul>
                </div>
                <IonButton onClick={() => setShowModal(false)}>Back to page</IonButton>
            </IonModal>
            <IonButton onClick={() => setShowModal(true)}>Show modal</IonButton>
        </>
    );
}