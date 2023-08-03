import { RenderInstruction, RenderSettings } from "./worker/worker";

/**
 * Basic pool which manages multiple rendering Web Workers. It accepts
 * rendering instructions and balances them among the workers in fi-fo. It can
 * also broadcast render settings to all workers at once.
 */
export default class RenderPool {
  private workers: {
    worker: Worker;
    isBusy: boolean;
  }[];

  private queue: {
    instruction: RenderInstruction;
    callback: (image: ImageData) => void;
    isCancelled: boolean;
  }[];

  constructor(size: number) {
    this.workers = [];
    this.queue = [];

    for (let i = 0; i < size; i++) {
      this.workers.push({
        worker: new Worker(new URL("./worker/worker.ts", import.meta.url), {
          type: "module",
        }),
        isBusy: false,
      });
    }
  }

  /**
   * Add rendering instruction to the queue. Returns function with which the
   * render can be cancelled, which will prevent them from starting and thus
   * using resources.
   */
  addRender(
    instruction: RenderInstruction,
    callback: (image: ImageData) => void,
  ) {
    const job = { instruction, callback, isCancelled: false };
    this.queue.push(job);
    this.tryRender();
    return () => {
      job.isCancelled = true;
    };
  }

  broadcastSettings(settings: RenderSettings) {
    this.workers.forEach((w) => {
      w.worker.postMessage(settings);
    });
  }

  private tryRender() {
    const worker = this.workers.find((w) => !w.isBusy);
    if (!worker) return;

    const next = this.queue.shift();
    if (!next) return;
    let job = next;
    while (job.isCancelled) {
      const next = this.queue.shift();
      if (!next) return;
      job = next;
    }

    worker.isBusy = true;
    worker.worker.onmessage = (ev: MessageEvent<ImageData>) => {
      worker.isBusy = false;
      if (!job.isCancelled) {
        job.callback(ev.data);
      }
      this.tryRender();
    };
    worker.worker.postMessage(job.instruction, [
      job.instruction.image.data.buffer,
    ]);
  }
}
