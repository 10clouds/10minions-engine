import { randomUUID } from 'crypto';
import * as path from 'path';
import { EditorDocument, EditorRange, EditorUri, getEditorManager } from '../managers/EditorManager';
import { getOriginalContentProvider } from '../managers/OriginalContentProvider';
import { TaskContext } from '../tasks/TaskContext';
import { APPLIED_STAGE_NAME, APPLYING_STAGE_NAME, CANCELED_STAGE_NAME, FINISHED_STAGE_NAME } from '../tasks/stageNames';
import { MINION_TASK_STRATEGY_ID } from './strategies';
import { WorkspaceFilesKnowledge } from './generateDescriptionForWorkspaceFiles';

export enum ApplicationStatus {
  APPLIED = 'applied',
  NOT_APPLIED = 'not applied',
  APPLIED_AS_FALLBACK = 'applied as fallback',
}

export class MinionTask implements TaskContext {
  readonly userQuery: string;
  readonly minionIndex: number;

  readonly documentURI: EditorUri;
  readonly selection: EditorRange;
  readonly selectedText: string;

  private _originalContent: string;

  readonly id: string;

  readonly onChange: (important: boolean) => Promise<void>;

  shortName: string;
  totalCost: number;
  logContent: string;
  executionStage: string;
  currentStageIndex = 0;
  startTime: number;
  stopped = true;
  progress = 1;
  stageTargetProgress = 1;
  strategyId: MINION_TASK_STRATEGY_ID | '';
  relevantKnowledgeIds: string[] = [];

  get isError(): boolean {
    if (!this.stopped) {
      return false;
    }

    if (this.executionStage === FINISHED_STAGE_NAME) {
      return false;
    }

    if (this.executionStage === CANCELED_STAGE_NAME) {
      return false;
    }

    if (this.executionStage === APPLYING_STAGE_NAME) {
      return false;
    }

    if (this.executionStage === APPLIED_STAGE_NAME) {
      return false;
    }

    return true;
  }

  get originalContent(): string {
    return this._originalContent;
  }

  set originalContent(value: string) {
    this._originalContent = value;
    getOriginalContentProvider().reportChange(this.originalContentURI);
  }

  //
  // tracking variables between stages
  //

  contentAfterApply: string;
  contentWhenDismissed: string;

  modificationDescription: string;
  modificationProcedure: string;

  inlineMessage: string;
  aplicationStatus?: ApplicationStatus;
  relevantKnowledge?: WorkspaceFilesKnowledge[];

  constructor({
    id,
    minionIndex,
    documentURI,
    userQuery,
    selection,
    selectedText,
    originalContent,
    finalContent = '',
    contentWhenDismissed = '',
    startTime,
    onChanged = async () => {
      throw new Error('Should be implemented');
    },
    shortName = '',
    modificationDescription = '',
    modificationProcedure = '',
    inlineMessage = '',
    executionStage = '',
    strategyId = '',
    relevantKnowledgeIds = [],
    logContent = '',
    totalCost = 0,
    aplicationStatus = ApplicationStatus.NOT_APPLIED,
    relevantKnowledge = [],
  }: {
    id: string;
    minionIndex: number;
    documentURI: EditorUri;
    userQuery: string;
    selection: EditorRange;
    selectedText: string;
    originalContent: string;
    finalContent?: string;
    contentWhenDismissed?: string;
    startTime: number;
    onChanged?: (important: boolean) => Promise<void>;
    shortName?: string;
    modificationDescription?: string;
    modificationProcedure?: string;
    executionStage?: string;
    inlineMessage?: string;
    strategyId?: MINION_TASK_STRATEGY_ID | '';
    relevantKnowledgeIds?: string[];
    logContent?: string;
    totalCost?: number;
    aplicationStatus?: ApplicationStatus;
    relevantKnowledge?: WorkspaceFilesKnowledge[];
  }) {
    this.id = id;
    this.minionIndex = minionIndex;
    this.documentURI = documentURI;
    this.userQuery = userQuery;
    this.selection = selection;
    this.selectedText = selectedText;
    this._originalContent = originalContent;
    this.contentAfterApply = finalContent;
    this.contentWhenDismissed = contentWhenDismissed;
    this.startTime = startTime;
    this.onChange = onChanged;
    this.shortName = shortName;
    this.modificationDescription = modificationDescription;
    this.modificationProcedure = modificationProcedure;
    this.inlineMessage = inlineMessage;
    this.executionStage = executionStage;
    this.strategyId = strategyId;
    this.relevantKnowledgeIds = relevantKnowledgeIds;
    this.logContent = logContent;
    this.totalCost = totalCost;
    this.aplicationStatus = aplicationStatus;
    this.relevantKnowledge = relevantKnowledge;
  }

  get originalContentURI() {
    return `10minions-originalContent:minionTaskId/${this.id}/${(this.shortName + '.txt').replace(/ /g, '%20')}`;
  }

  static async create({
    userQuery,
    document,
    selection,
    selectedText,
    minionIndex,
    onChanged,
  }: {
    userQuery: string;
    document: EditorDocument;
    selection: EditorRange;
    selectedText: string;
    minionIndex: number;
    onChanged: (important: boolean) => Promise<void>;
  }): Promise<MinionTask> {
    const minionTaskId = randomUUID();

    const execution = new MinionTask({
      id: minionTaskId,
      minionIndex,
      documentURI: document.uri,
      userQuery,
      selection,
      selectedText,
      originalContent: await document.getText(),
      startTime: Date.now(),
      onChanged,
    });

    execution.stopped = false;
    execution.progress = 1;

    return execution;
  }

  public async document() {
    const document = await getEditorManager().openTextDocument(this.documentURI);
    return document;
  }

  get baseName() {
    return path.basename(this.documentURI.fsPath);
  }
}
