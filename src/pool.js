/**
 * Creates a pool of web workers and a queue to which instructions can be added,
 * which will be executed in fi-fo by the workers. An instruction consists of a
 * message, an array of Transferable objects (empty if not needed) and a
 * callback function which is called when the instruction has finished
 * (a.k.a. the worker has posted a message back). Returns a function with which
 * a certain message can be sent to all workers and a function with which to add
 * instructions to the queue. The latter function returns a function with which
 * the instruction can be removed from the queue if you want to cancel it.
 */
export default (workerCount) => {
  const queue = []
  const pool = []

  // Populate the pool with workers
  for (let i = 0; i < workerCount; i++) {
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
  
  // Send single message to all the workers
  const sendMessage = (message, transferables) => {
    pool.forEach((worker) => {
      worker.postMessage(message, transferables)
    })
  }

  return { addJob, sendMessage }
}
