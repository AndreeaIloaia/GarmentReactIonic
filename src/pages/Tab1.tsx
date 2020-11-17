import React, { useState } from 'react';
import {
  IonCard,
  IonContent,
  IonHeader,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter
} from '@ionic/react';


const Tab1: React.FC = () => {
  const [items, setItems] = useState<string[]>([]);
  const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);

  async function fetchData() {
    const url: string = 'https://dog.ceo/api/breeds/image/random/3';
    const res: Response = await fetch(url);
    res
      .json()
      .then(async (res) => {
        if (res && res.message && res.message.length > 0) {
          setItems([...items, ...res.message]);
          setDisableInfiniteScroll(res.message.length < 3);
        } else {
          setDisableInfiniteScroll(true);
        }
      })
      .catch(err => console.error(err));
  }

  useIonViewWillEnter(async () => {
    await fetchData();
  });

  async function searchNext($event: CustomEvent<void>) {
    await fetchData();
    ($event.target as HTMLIonInfiniteScrollElement).complete();
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {items.map((item: string, i: number) => {
          return <IonCard key={`${i}`}><img src={item}/></IonCard>
        })}
        <IonInfiniteScroll threshold="100px" disabled={disableInfiniteScroll}
                           onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
          <IonInfiniteScrollContent
            loadingText="Loading more good doggos...">
          </IonInfiniteScrollContent>
        </IonInfiniteScroll>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
