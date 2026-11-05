/** Curated technology quiz bank: no API, account, network request or billable model needed.
 * Each record: [question, correct answer, distractor 1, distractor 2, distractor 3, explanation].
 * Store the correct answer first; createDeck shuffles the options before display.
 */
export const TOPICS = Object.freeze([
  {id:'all', label:'Surprise me — all tech topics'},
  {id:'ai', label:'Artificial intelligence & ML'},
  {id:'neural', label:'Neural networks'},
  {id:'python', label:'Python'},
  {id:'security', label:'Cybersecurity'},
  {id:'web', label:'Web development'},
  {id:'data', label:'Databases & SQL'},
]);
const BANK = {
  ai: {
    Beginner: [
      ['What does AI stand for?', 'Artificial intelligence','Automated internet','Advanced integration','Adaptive information','AI stands for artificial intelligence.'],
      ['Which example is a common use of machine learning?', 'Email spam classification','Manually sorting paper files','Replacing a light bulb','Typing a password by hand','Spam filters can learn from labeled examples.'],
      ['Which type of learning uses labeled examples?', 'Supervised learning','Unsupervised learning','Reinforcement learning','Random search','Supervised learning trains models using known input-output pairs.'],
      ['What is a model in machine learning?', 'A learned mathematical system used to make predictions','A monitor showing charts','A programming font','A cloud storage folder','An ML model contains learned relationships that can be used for predictions or decisions.'],
      ['Which is a common task for computer vision?', 'Recognizing objects in pictures','Converting voltage','Cooling a CPU','Editing a spreadsheet formula','Computer vision systems process visual data such as images and video.'],
      ['What is training data?', 'Examples used to fit a model','Only the model output shown to users','A CPU benchmark','A web domain','Training data provides the examples from which a model learns patterns.'],
    ],
    Intermediate: [
      ['What is overfitting?', 'Learning training examples too specifically and generalizing poorly','Training only on too little memory','Removing all training features','Running evaluation before training','An overfit model performs well on training data but poorly on unseen examples.'],
      ['Why keep a separate test set?', 'To estimate generalization on unseen data','To permanently raise training accuracy','To store source code','To eliminate all bias','An untouched test set helps evaluate performance beyond training data.'],
      ['What does precision measure in classification?', 'Correct positive predictions divided by all predicted positives','Correct negatives divided by all negatives','All predictions divided by training size','The number of model layers','Precision is TP / (TP + FP).'],
      ['Why use cross-validation?', 'To estimate performance across multiple train-validation splits','To encrypt model weights','To remove labels from a dataset','To guarantee perfect accuracy','Cross-validation repeats evaluation across different partitions for a more reliable estimate.'],
      ['What is a feature in machine learning?', 'An input variable used by a model','A model-specific password','A graphics driver','A fixed output value','Features describe properties of examples supplied to a model.'],
      ['What is the purpose of a confusion matrix?', 'Summarize predicted versus true classification labels','Calculate GPU electricity costs','Display an SQL join','Measure internet latency','The matrix counts correct and incorrect predictions by class.'],
    ],
    Advanced: [
      ['Why can data leakage make test accuracy misleading?', 'The model indirectly gains information unavailable at prediction time','It reduces file compression','It disables reproducibility seeds','It always lowers test accuracy','Leakage makes evaluation overly optimistic by exposing information from the target or future.'],
      ['Which metric is the area under a precision–recall curve?', 'Average precision','Mean squared error','Perplexity','Silhouette score','Average precision summarizes the precision–recall curve and is useful for imbalanced classification.'],
      ['What is concept drift?', 'The relationship between inputs and targets changes over time','The number of features goes to zero','The model changes programming languages','The same dataset is sorted differently','Concept drift occurs when the prediction relationship changes after deployment.'],
      ['When might calibration be important?', 'When predicted probabilities are used to make thresholded risk decisions','When choosing a laptop color','Only when there is one class','When eliminating all false negatives is impossible','A calibrated model makes probabilities that reflect observed event frequencies.'],
      ['What is the purpose of regularization?', 'Discourage overly complex models or large parameters to improve generalization','Guarantee training loss reaches zero','Replace test data','Force all model weights to be identical','Regularization adds constraints or penalties that can reduce overfitting.'],
      ['What is the main risk of evaluating after repeatedly tuning on a test set?', 'The test set becomes part of the selection process','The model cannot be saved','The optimizer always diverges','Inference becomes impossible','Using the test results to tune a model biases the final generalization estimate.'],
    ],
  },
  neural: {
    Beginner: [
      ['What is an artificial neuron?', 'A unit that combines inputs and applies an activation','A physical transistor that thinks','A hard drive sector','A network router','Artificial neurons compute weighted combinations and often apply a nonlinearity.'],
      ['What is a neural network layer?', 'A collection of units performing a stage of computation','A database backup','A physical cable','An operating system update','Layers transform representations as data passes through a network.'],
      ['What is the purpose of an activation function?', 'Introduce nonlinearity into a network','Compress files into ZIPs','Format HTML','Control fan speed','Without nonlinear activations, stacked linear layers remain a linear transformation.'],
      ['Which task can a convolutional neural network help solve?', 'Image classification','Replacing an Ethernet socket','Printing a PDF','Partitioning a hard disk','CNNs use convolutional filters to learn visual patterns.'],
      ['What is a neural network weight?', 'A learned parameter controlling a connection or transformation','The physical mass of a GPU','A network cable gauge','An image resolution','Training adjusts weights to reduce prediction error.'],
      ['What is inference?', 'Using a trained model to make an output for new input','Collecting labels only','Deleting model parameters','Manufacturing a processor','Inference runs the learned model on an input to generate predictions.'],
    ],
    Intermediate: [
      ['Which algorithm computes gradients efficiently through layers?', 'Backpropagation','Breadth-first search','Binary search','Round-robin scheduling','Backpropagation applies the chain rule to find loss gradients of parameters.'],
      ['What does dropout do during neural network training?', 'Randomly deactivates selected units to help regularize','Permanently removes every second layer','Doubles the batch size','Converts vectors to images','Dropout randomly zeros activations during training to discourage co-adaptation.'],
      ['Why use mini-batches during training?', 'To estimate gradients using subsets of data','To eliminate all randomness','To replace the optimizer','To prevent any parameter updates','Mini-batches balance gradient estimate quality and compute efficiency.'],
      ['Which activation returns max(0, x)?', 'ReLU','Softmax','Sigmoid','Tanh','The rectified linear unit outputs zero for negative values and x for positive values.'],
      ['What does an embedding layer usually produce?', 'A learned vector representation of discrete inputs','An electrical connection','A browser cookie','A compressed image file','Embeddings map items such as token IDs to dense learned vectors.'],
      ['In a classifier, what does softmax commonly produce?', 'A probability distribution over classes','The maximum memory address','Encrypted weights','A list of HTML elements','Softmax converts logits into nonnegative values that sum to one.'],
    ],
    Advanced: [
      ['Why is scaled dot-product attention divided by sqrt(d_k)?', 'To limit dot-product magnitude before softmax','To remove all positional information','To guarantee equal attention across tokens','To turn attention into convolution','Scaling reduces the risk of softmax saturation from large dot products.'],
      ['Which issue can residual connections help mitigate?', 'Difficulty optimizing deep networks','The need for datasets','The use of tokenization','An insecure API token','Residual paths help gradients and representations flow through deep architectures.'],
      ['What is gradient clipping used for?', 'Limit unusually large gradient norms or values','Increase vocabulary size','Normalize CSS colors','Guarantee a global optimum','Clipping can stabilize training when gradients become very large.'],
      ['What does layer normalization normalize?', 'Features of an example within a layer','All training labels across the dataset','The browser viewport','The physical GPU temperature','Layer normalization uses statistics across a chosen feature dimension for each example.'],
      ['Why are positional encodings needed in a transformer without recurrence?', 'Self-attention alone does not encode token order','They reduce file sizes','They encrypt embeddings','They guarantee zero loss','Position information lets attention-based models distinguish different token orders.'],
      ['What is teacher forcing in sequence model training?', 'Using ground-truth previous tokens as decoder inputs','Training only human teachers','Removing cross-entropy loss','Running inference without labels','Teacher forcing supplies the known previous target token during training.'],
    ],
  },
  python: {
    Beginner: [
      ['Which data type stores an ordered mutable sequence in Python?', 'list','tuple','str','frozenset','Lists preserve order and can be changed after creation.'],
      ['Which keyword defines a Python function?', 'def','func','function','lambda_only','Python uses def to declare named functions.'],
      ['What does len([1, 2, 3]) return?', '3','2','4','None','len returns the number of items in the list.'],
      ['Which structure maps keys to values in Python?', 'dict','set','list','tuple','A dictionary stores key-value associations.'],
      ['Which operator checks value equality in Python?', '==','=','===','!=','== compares values; = assigns a value.'],
      ['What does range(3) iterate over?', '0, 1, 2','1, 2, 3','0, 1, 2, 3','3 only','range(3) yields integers starting at zero up to but excluding three.'],
    ],
    Intermediate: [
      ['What does a list comprehension produce?', 'A new list from an expression and iteration','A database table','A reusable class file','A tuple only','List comprehensions provide compact list-building syntax.'],
      ['What does the with statement commonly help manage?', 'Context-managed resources such as open files','Browser styles','Python package names','CPU cores','Context managers arrange setup and cleanup, even when exceptions occur.'],
      ['What does *args capture in a function definition?', 'Extra positional arguments as a tuple','Only keyword arguments','A list of modules','The current call stack','*args gathers additional positional arguments into a tuple.'],
      ['What is a generator function characterized by?', 'Yielding values lazily with yield','Always returning a list','Executing only once','Disabling exceptions','Generators produce items on demand as they are iterated.'],
      ['What is the result of {1, 2, 2}?', 'A set containing 1 and 2','A list with three elements','A tuple with two elements','A dictionary','Sets remove duplicate elements.'],
      ['Why use try and except?', 'To handle expected exceptions without crashing','To speed up every loop','To change Python syntax','To encrypt input','Exception handlers can recover from or report errors.'],
    ],
    Advanced: [
      ['What is the purpose of Python __enter__ and __exit__ methods?', 'Implement the context manager protocol','Define multiplication','Declare a coroutine','Override integer hashing','The with statement calls context manager methods to manage resource lifetimes.'],
      ['What does the Global Interpreter Lock mean for standard CPython builds?', 'Only one thread executes Python bytecode at a time within an interpreter','Python has no threads','Multiprocessing is forbidden','All I/O happens sequentially','Traditional CPython uses a GIL, though free-threaded builds are available in newer versions.'],
      ['Why is mutable default argument state a risk?', 'The same default object may be reused across calls','It always raises a SyntaxError','Python automatically copies the default','It blocks keyword arguments','Default argument expressions are evaluated when the function is defined.'],
      ['What is a Python descriptor?', 'An object defining attribute access with methods such as __get__','A compressed JSON file','A fixed type annotation','A process scheduler','Descriptors customize how attributes are retrieved, set, or deleted.'],
      ['What distinguishes an async def coroutine?', 'Its body can suspend at await expressions','It always runs in a new OS thread','It cannot return values','It forbids exceptions','Async coroutines cooperate with an event loop and can pause at await.'],
      ['What can functools.lru_cache do?', 'Memoize function results based on call arguments','Prevent all recursion','Compile Python to Rust','Make mutable inputs hashable','LRU caching retains selected results for later calls with matching hashable arguments.'],
    ],
  },
  security: {
    Beginner: [
      ['What does MFA stand for?', 'Multi-factor authentication','Main file access','Managed firewall algorithm','Multiple format archive','MFA verifies identity with more than one distinct authentication factor.'],
      ['What is phishing?', 'Deceiving people into revealing information or taking harmful actions','Encrypting a backup','Checking source code formatting','Measuring network speed','Phishing messages impersonate trusted sources to manipulate recipients.'],
      ['What does HTTPS primarily add over HTTP?', 'Encrypted transport with server authentication through TLS','Guaranteed safe site content','Automatic virus removal','Unlimited bandwidth','HTTPS protects data in transit and helps authenticate the server.'],
      ['Which is a strong password practice?', 'Use a unique password for each account','Reuse one complex password everywhere','Share passwords with colleagues','Keep passwords in public notes','Unique passwords limit the damage of a credential breach.'],
      ['What is malware?', 'Software intended to harm or compromise systems','Any free program','A broken keyboard','A software license','Malware includes malicious programs such as ransomware and spyware.'],
      ['Why apply software security patches?', 'To fix known vulnerabilities','To remove all user accounts','To increase monitor brightness','To change a website font','Patches can close flaws attackers might exploit.'],
    ],
    Intermediate: [
      ['What is the principle of least privilege?', 'Grant only permissions necessary for the task','Give everyone administrator rights','Disable access logs','Share all credentials','Least privilege reduces the impact of errors and compromised accounts.'],
      ['What is a SQL injection vulnerability?', 'Untrusted input changes the structure of a database query','A query that is too slow','A missing CSS style','An encrypted SQL connection','Injection occurs when data is interpreted as executable SQL.'],
      ['What helps prevent cross-site scripting (XSS)?', 'Context-appropriate output encoding','Using longer passwords','Removing database indexes','Turning off TLS','Output encoding prevents untrusted data from being treated as executable browser code.'],
      ['What does a cryptographic hash generally provide?', 'A fixed-length digest of data','Reversible encryption by itself','Identity verification without keys','A guaranteed unique random number','Cryptographic hash functions map arbitrary input to fixed-size digests.'],
      ['What is network segmentation?', 'Separating networks to limit access and lateral movement','Making all devices public','Deleting firewall rules','Combining all VLANs','Segmentation helps restrict which systems can communicate.'],
      ['Which HTTP flag prevents JavaScript from reading a cookie?', 'HttpOnly','SecureOnly','NoScript','SameSiteNone','HttpOnly cookies cannot be accessed through document.cookie.'],
    ],
    Advanced: [
      ['What is a replay attack?', 'Reusing captured valid messages to gain an unauthorized effect','Guessing weak passwords','Removing an SSL certificate','Deleting a cache','Nonce-based protocols and freshness checks can mitigate replay attacks.'],
      ['What does forward secrecy aim to protect?', 'Past encrypted sessions even if a long-term private key is later compromised','All future passwords forever','Data against every endpoint compromise','Availability during DDoS','Ephemeral key exchanges can keep recorded past sessions confidential after long-term key loss.'],
      ['What problem does CSRF primarily exploit?', 'A browser sends an authenticated request the user did not intend','A server returns a 404','A password is too long','A client uses an outdated font','CSRF abuses ambient credentials such as cookies on cross-origin requests.'],
      ['What is an SSRF vulnerability?', 'Server-side code can be induced to request attacker-chosen resources','A browser fails to render SVG','A database deadlock','A weak encryption key','Server-side request forgery can let attackers reach internal services via a vulnerable server.'],
      ['What is key rotation?', 'Replacing active cryptographic keys according to policy or after compromise','Changing physical keyboard layouts','Renaming a TLS certificate file only','Deleting every user session','Key rotation limits exposure from long-lived or compromised keys.'],
      ['Why use constant-time comparison for secrets?', 'Reduce timing information leakage about matching bytes','Guarantee hashes never collide','Make encryption deterministic','Speed up all requests','Timing-safe comparisons help reduce attacks that infer secret values from response times.'],
    ],
  },
  web: {
    Beginner: [
      ['What does HTML primarily define?', 'Document structure and semantics','Database indexes','Transport encryption','GPU memory layout','HTML represents page content and its meaning.'],
      ['What is CSS used for?', 'Styling and layout of web pages','Storing user passwords','Compiling operating systems','Running SQL joins','CSS controls presentation, colors, spacing, and layout.'],
      ['What does JavaScript often provide on a website?', 'Interactive behavior','Physical internet cabling','DNS registration','Hardware cooling','JavaScript handles events, dynamic UI updates, and browser APIs.'],
      ['What is responsive design?', 'Layout adapting to different devices and viewport sizes','A website that replies to emails','Only desktop styling','A faster CPU','Responsive design adapts interfaces across screen dimensions and input types.'],
      ['What is a hyperlink made with in HTML?', 'An anchor element (a)','A style element','A section element only','A title element','The a element creates navigable links with href.'],
      ['Which HTML element is used for the main unique content of a page?', 'main','head','meta','script','The main landmark identifies the primary page content.'],
    ],
    Intermediate: [
      ['What does event.preventDefault() do?', 'Cancel an event’s default browser action when cancelable','Stop every script on the page','Remove all event listeners','Reset the DOM','preventDefault can prevent a form submission or link navigation.'],
      ['What does the CSS grid layout system provide?', 'Two-dimensional row-and-column layout','Only text coloring','Network routing','Database pagination','CSS Grid arranges items along rows and columns.'],
      ['Why use semantic HTML elements?', 'Improve meaning and accessibility for tools and users','Prevent all JavaScript errors','Automatically compress images','Replace server security','Semantics communicate structure to browsers and assistive technologies.'],
      ['What is a Content Security Policy (CSP)?', 'A browser-enforced policy restricting resource loads and some script execution','A server-side language','A password format','An HTML template engine','CSP can help reduce the impact of certain injection attacks.'],
      ['What does HTTP status 404 indicate?', 'Requested resource was not found','Authentication succeeded','Server completed a redirect','Request body was too large','404 means the server did not find the requested target.'],
      ['What is lazy-loading an image?', 'Deferring its load until it is needed','Always loading it first','Converting it to HTML','Removing image metadata','Lazy loading can reduce initial page work and transferred data.'],
    ],
    Advanced: [
      ['What does Cumulative Layout Shift (CLS) measure?', 'Unexpected visual movement of page elements','The size of the JavaScript bundle','Average database response size','HTML parsing speed','CLS is a web performance metric for unexpected layout shifts.'],
      ['What is hydration in a client-rendered web application?', 'Attaching interactive behavior to server-rendered markup','Loading fonts into GPU memory','Compressing CSS selectors','Storing cookies in memory','Hydration connects client-side application logic to HTML delivered by a server.'],
      ['Which HTTP header can prevent MIME-type sniffing?', 'X-Content-Type-Options: nosniff','Accept-Language','Cache-Control: public','Content-Length','The nosniff directive tells browsers not to guess some response content types.'],
      ['What helps avoid layout shifts for image assets?', 'Reserving dimensions or aspect ratio before load','Removing alternative text','Disabling HTTPS','Setting every width to auto without sizing','Reserved layout space keeps surrounding content stable while images load.'],
      ['What does requestAnimationFrame optimize for?', 'Scheduling visual updates ahead of browser repaint','Making network requests synchronous','Generating database IDs','Automatically preventing all memory leaks','Animation-frame callbacks align DOM animation work with repaint timing.'],
      ['Why use an AbortController for fetch requests?', 'To cancel in-flight requests when no longer needed','To make every request cacheable','To compress JSON by default','To replace TLS','AbortController provides a signal used to cancel supported asynchronous operations.'],
    ],
  },
  data: {
    Beginner: [
      ['What does SQL stand for?', 'Structured Query Language','Simple Question Logic','Server Queue Layer','System Quality List','SQL is the standard language used to interact with relational databases.'],
      ['Which SQL statement retrieves rows?', 'SELECT','INSERT','DROP','ALTER','SELECT queries data from one or more tables.'],
      ['What is a primary key?', 'A column or set of columns uniquely identifying table rows','A database password','A backup directory','A web route','Primary key constraints enforce row identity.'],
      ['What does a database table contain?', 'Rows and columns','Only image files','Only functions','Network packets','Relational tables organize records in rows with defined columns.'],
      ['Which SQL clause filters rows?', 'WHERE','ORDER BY','SELECT','JOIN','WHERE limits the rows returned or affected according to a condition.'],
      ['What does NULL represent in SQL?', 'A missing or unknown value','The integer zero','An empty string always','A false boolean always','NULL is a marker for missing or unknown data, not necessarily zero or empty text.'],
    ],
    Intermediate: [
      ['What is an INNER JOIN used for?', 'Return rows with matching join conditions in both inputs','Return every unmatched row','Remove duplicate tables','Create a backup','INNER JOIN combines matching rows from the joined relations.'],
      ['What is a database index generally for?', 'Speed up selected data lookups at a maintenance cost','Encrypt all table values','Prevent all bad queries','Replace every primary key','Indexes can improve query performance but consume space and add write overhead.'],
      ['What does GROUP BY do?', 'Group rows for aggregate calculations','Sort the database physically','Delete duplicate rows automatically','Change column types','GROUP BY forms groups of rows before applying aggregate expressions.'],
      ['What does a foreign key help enforce?', 'Referential integrity between tables','Password rotation','Client-side layout','Image compression','Foreign keys restrict references to valid related records under configured rules.'],
      ['What is a transaction in a database?', 'A unit of work that commits or rolls back','A style rule','A single server process only','An encryption standard','Transactions group operations into a logical unit.'],
      ['What does ORDER BY affect in SQL?', 'The order of result rows','The physical schema of every table','The table owner','The transaction isolation level','ORDER BY defines result ordering.'],
    ],
    Advanced: [
      ['What does serializable isolation aim to guarantee?', 'Concurrent transactions behave like some serial execution order','Every query takes constant time','All reads avoid locking','No transaction can be rolled back','Serializable isolation provides an outcome equivalent to a serial transaction schedule.'],
      ['Why can a composite index on (a,b) help a query filtering by a?', 'The index can often be used via its leading column','All index columns are hashed independently','It removes all JOINs','It is always faster than full scans','In common B-tree indexes, leading-key searches can take advantage of the index order.'],
      ['What is a phantom read?', 'A repeated query sees a different set of matching rows due to concurrent changes','A query returns a null value','A database loses a file','A table has no primary key','Phantoms arise when new or removed matching rows appear across repeated reads in a transaction.'],
      ['What does a query execution plan describe?', 'How the database expects to access and combine data','The exact UI color','User account permissions only','The backup schedule','An execution plan outlines operations such as scans, joins, and sorts.'],
      ['Why use prepared statements with parameters?', 'Keep user values separate from SQL syntax','Guarantee every query is fast','Avoid all authentication','Hide every schema name','Parameterized statements help prevent SQL injection and can improve query reuse.'],
      ['What is denormalization?', 'Intentionally duplicating or combining data to optimize some access patterns','Encrypting every table','Converting all rows to XML','Deleting all foreign keys','Denormalization trades some redundancy and update complexity for potential read performance.'],
    ],
  },
};
const records=[];
for (const [topic,levels] of Object.entries(BANK)) for(const [level,items] of Object.entries(levels)) {
  for(let i=0;i<items.length;i++) {
    const [question,correct,...rest]=items[i];
    const explanation=rest.pop();
    records.push(Object.freeze({id:`${topic}-${level.toLowerCase()}-${i+1}`,topic,level,question,
      options:Object.freeze([correct,...rest]),correct,explanation}));
  }
}
export const QUESTION_BANK = Object.freeze(records);
