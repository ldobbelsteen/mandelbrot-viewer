/**
 * Creates a pool of web workers ("threads") and a queue to which instructions
 * can be added, which will be executed in fifo by the threads. An instruction
 * consists of a message, an array of Transferable objects (empty if not needed)
 * and a callback function which is called when finished. Returns the function
 * with which to add instructions to the queue. This function in turn returns
 * a function with which you can cancel the instruction later if desired.
 */
export default (threadCount) => {
  const queue = []
  const pool = []

  // Populate the pool with workers
  for (let i = 0; i < threadCount; i++) {
    const worker = new Worker('./worker.js')
    worker.busy = false
    pool.push(worker)
  }

  // Execute next job in queue
  const nextJob = () => {
    const worker = pool.find(worker => !worker.busy)
    if (worker === undefined) return

    // Find the oldest job that hasn't been cancelled
    var job
    do {
      job = queue.shift()
      if (job === undefined) return
    } while (job.cancelled)

    worker.busy = true
    worker.onmessage = (event) => {
      worker.busy = false
      if (!job.cancelled) job.callback(event)
      nextJob()
    }
    worker.postMessage(job.message, job.transferables)
  }

  // Add a job to the queue
  const addJob = (message, transferables, callback) => {
    const instruction = { message, transferables, callback, cancelled: false }
    queue.push(instruction)
    nextJob()
    return () => instruction.cancelled = true
  }

  return { addJob }
}
