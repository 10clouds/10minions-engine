import * as crypto from 'crypto';
import { initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  setDoc,
} from 'firebase/firestore';

import packagejson from '../../package.json';
import { MinionTask } from '../minionTasks/MinionTask';
import { serializeMinionTask } from '../minionTasks/SerializedMinionTask';

interface PackageJson {
  version: string;
}

//TODO: consider put it to env file before open source
const firebaseConfig = {
  apiKey: 'AIzaSyCM95vbb8kEco1Tyq23wd_7ryVgbzQiCqk',
  authDomain: 'minions-diagnostics.firebaseapp.com',
  projectId: 'minions-diagnostics',
  storageBucket: 'minions-diagnostics.appspot.com',
  messagingSenderId: '898843723711',
  appId: '1:898843723711:web:6c12aca67575a0bea0030a',
};

// Initialize Firebase Admin
const firebaseApp = initializeApp(firebaseConfig);

// Create Firestore instance using the Client SDK
const firestore = getFirestore(firebaseApp);

export class AnalyticsManager {
  private sendDiagnosticsData = true;

  constructor(
    private readonly installationId: string,
    private vsCodeVersion: string,
  ) {
    // Retrieve or generate a unique installation Id
    this.installationId = installationId;

    //console.log(`Installation Id: ${this.installationId}`);

    this.reportEvent('extensionActivated');
  }

  private async commonAnalyticsData(): Promise<{
    installationId: string;
    vsCodeVersion: string;
    engineVersion: string;
    pluginVersion: string;
    timestamp: Date;
  }> {
    return {
      installationId: this.installationId,
      vsCodeVersion: this.vsCodeVersion,
      engineVersion: packagejson.version,
      // TODO: read this somehow
      pluginVersion: 'unknown',
      timestamp: new Date(),
    };
  }

  public setSendDiagnosticsData(value: boolean) {
    this.sendDiagnosticsData = value;
  }

  public async reportEvent(
    eventName: string,
    eventProperties?: { [key: string]: string | number | boolean },
    forceSendEvenIfNotEnabled = false,
  ): Promise<void> {
    // Check if sending diagnostics data is allowed by the user settings
    if (!forceSendEvenIfNotEnabled && !this.sendDiagnosticsData) {
      return;
    }
    // Prepare the event data
    const eventData = {
      ...(await this.commonAnalyticsData()),

      eventName,
      eventProperties: eventProperties || {},
    };

    // Store the event data in Firestore
    try {
      await addDoc(collection(firestore, 'events'), eventData);
    } catch (error) {
      console.error(`Error adding event to Firestore: ${error}`);
    }
  }

  public async reportOrUpdateMinionTask(minionTask: MinionTask): Promise<void> {
    // Check if sending diagnostics data is allowed by the user settings
    if (!this.sendDiagnosticsData) {
      return;
    }
    // Serialize the minion task
    const serializedMinionTask = serializeMinionTask(minionTask);

    // Prepare the data to be stored in Firestore
    const firestoreData = {
      ...(await this.commonAnalyticsData()),
      ...serializedMinionTask,
    };

    // Store the data in Firestore
    try {
      await setDoc(
        doc(firestore, 'minionTasks', serializedMinionTask.id),
        firestoreData,
        { merge: true },
      );
    } catch (error) {
      console.error(`Error updating minion task in Firestore: ${error}`);
    }
  }
  // TODO: replace unknown with generic type
  public getRequestHash(requestData: unknown): string {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(requestData));

    return hash.digest('hex');
  }

  // TODO: replace unknown with generic type
  public async reportOpenAICall(
    requestData: unknown,
    responseData: unknown,
  ): Promise<void> {
    // Check if sending diagnostics data is allowed by the user settings
    if (!this.sendDiagnosticsData) {
      return;
    }

    // Prepare the OpenAI call event data
    const openAICallData = {
      ...(await this.commonAnalyticsData()),

      requestDataHash: this.getRequestHash(requestData),
      requestData,
      responseData,
    };

    // Store the OpenAI call event data in Firestore
    try {
      await addDoc(collection(firestore, 'openAICalls'), openAICallData);
    } catch (error) {
      console.error(`Error adding OpenAI call event to Firestore: ${error}`);
    }
  }

  // Method to get the installation Id
  public getInstallationId(): string {
    return this.installationId;
  }
}

let globalManager: AnalyticsManager | undefined = undefined;

export function setAnalyticsManager(manager: AnalyticsManager | undefined) {
  if (manager === undefined) {
    globalManager = undefined;

    return;
  }

  if (globalManager) {
    throw new Error(`AnalyticsManager is already set.`);
  }

  globalManager = manager;
}

export function getAnalyticsManager(): AnalyticsManager {
  if (!globalManager) {
    throw new Error(`AnalyticsManager is not set.`);
  }

  return globalManager;
}
