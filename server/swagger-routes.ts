/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and session management
 *   - name: Dashboard
 *     description: Dashboard metrics and analytics
 *   - name: Leads
 *     description: Lead management operations
 *   - name: Properties
 *     description: Property listing management
 *   - name: Deals
 *     description: Deal pipeline management
 *   - name: Tasks
 *     description: Task and activity management
 *   - name: Communications
 *     description: Communication tracking and management
 *   - name: Notifications
 *     description: Notification system
 *   - name: AI Services
 *     description: AI-powered insights and automation
 *   - name: Object Storage
 *     description: File upload and storage management
 */

// Authentication Routes
/**
 * @swagger
 * /api/auth/user:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Authentication]
 *     security:
 *       - SessionAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Dashboard Routes
/**
 * @swagger
 * /api/dashboard/metrics:
 *   get:
 *     summary: Get dashboard metrics for current user
 *     tags: [Dashboard]
 *     security:
 *       - SessionAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardMetrics'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/analytics/detailed:
 *   get:
 *     summary: Get detailed analytics data
 *     tags: [Dashboard]
 *     security:
 *       - SessionAuth: []
 *     responses:
 *       200:
 *         description: Detailed analytics including conversion rates, revenue trends, and performance metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalLeads:
 *                   type: integer
 *                 qualifiedLeads:
 *                   type: integer
 *                 conversionRate:
 *                   type: number
 *                 monthlyRevenue:
 *                   type: number
 *                 dealsPipeline:
 *                   type: array
 *                   items:
 *                     type: object
 *                 leadSourceBreakdown:
 *                   type: object
 *                 revenueByMonth:
 *                   type: array
 *                   items:
 *                     type: object
 */

// Lead Routes
/**
 * @swagger
 * /api/leads:
 *   get:
 *     summary: Get all leads with optional filtering
 *     tags: [Leads]
 *     security:
 *       - SessionAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, contacted, qualified, proposal, negotiation, closed, lost]
 *         description: Filter leads by status
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter leads by assigned user ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search leads by name or email
 *     responses:
 *       200:
 *         description: List of leads
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lead'
 *   post:
 *     summary: Create a new lead
 *     tags: [Leads]
 *     security:
 *       - SessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLead'
 *     responses:
 *       200:
 *         description: Created lead with AI scoring
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lead'
 *       400:
 *         description: Invalid lead data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/leads/{id}:
 *   get:
 *     summary: Get a specific lead by ID
 *     tags: [Leads]
 *     security:
 *       - SessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lead ID
 *     responses:
 *       200:
 *         description: Lead details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lead'
 *       404:
 *         description: Lead not found
 *   patch:
 *     summary: Update a lead
 *     tags: [Leads]
 *     security:
 *       - SessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lead ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               status:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated lead
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lead'
 */

/**
 * @swagger
 * /api/leads/{id}/status:
 *   patch:
 *     summary: Update lead status
 *     tags: [Leads]
 *     security:
 *       - SessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lead ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, contacted, qualified, proposal, negotiation, closed, lost]
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Lead with updated status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lead'
 */

// Property Routes
/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Get all properties with optional filtering
 *     tags: [Properties]
 *     security:
 *       - SessionAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, under_contract, sold, off_market]
 *         description: Filter properties by status
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *           enum: [house, apartment, condo, townhouse, land, commercial]
 *         description: Filter properties by type
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *     responses:
 *       200:
 *         description: List of properties
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Property'
 *   post:
 *     summary: Create a new property listing
 *     tags: [Properties]
 *     security:
 *       - SessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               propertyType:
 *                 type: string
 *               price:
 *                 type: number
 *               bedrooms:
 *                 type: integer
 *               bathrooms:
 *                 type: number
 *               squareFeet:
 *                 type: integer
 *               description:
 *                 type: string
 *             required:
 *               - title
 *               - address
 *               - city
 *               - state
 *               - propertyType
 *               - price
 *     responses:
 *       200:
 *         description: Created property
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 */

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get a specific property by ID
 *     tags: [Properties]
 *     security:
 *       - SessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 *       404:
 *         description: Property not found
 *   patch:
 *     summary: Update a property
 *     tags: [Properties]
 *     security:
 *       - SessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *               status:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated property
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 */

// Deal Routes
/**
 * @swagger
 * /api/deals:
 *   get:
 *     summary: Get all deals with optional filtering
 *     tags: [Deals]
 *     security:
 *       - SessionAuth: []
 *     parameters:
 *       - in: query
 *         name: stage
 *         schema:
 *           type: string
 *           enum: [inquiry, showing, offer, negotiation, under_contract, closing, closed, lost]
 *         description: Filter deals by stage
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter deals by assigned user ID
 *     responses:
 *       200:
 *         description: List of deals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Deal'
 *   post:
 *     summary: Create a new deal
 *     tags: [Deals]
 *     security:
 *       - SessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leadId:
 *                 type: string
 *                 format: uuid
 *               propertyId:
 *                 type: string
 *                 format: uuid
 *               stage:
 *                 type: string
 *                 enum: [inquiry, showing, offer, negotiation, under_contract, closing, closed, lost]
 *               dealValue:
 *                 type: number
 *               expectedCloseDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *             required:
 *               - leadId
 *               - stage
 *               - dealValue
 *     responses:
 *       200:
 *         description: Created deal
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Deal'
 */

/**
 * @swagger
 * /api/deals/{id}:
 *   get:
 *     summary: Get a specific deal by ID
 *     tags: [Deals]
 *     security:
 *       - SessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Deal ID
 *     responses:
 *       200:
 *         description: Deal details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Deal'
 *       404:
 *         description: Deal not found
 *   patch:
 *     summary: Update a deal
 *     tags: [Deals]
 *     security:
 *       - SessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Deal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stage:
 *                 type: string
 *               dealValue:
 *                 type: number
 *               probability:
 *                 type: integer
 *               expectedCloseDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated deal
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Deal'
 */

// Task Routes
/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks with optional filtering
 *     tags: [Tasks]
 *     security:
 *       - SessionAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed]
 *         description: Filter tasks by status
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter tasks by assigned user ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [call, email, meeting, document, visit, research]
 *         description: Filter tasks by type
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - SessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [call, email, meeting, document, visit, research]
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               leadId:
 *                 type: string
 *                 format: uuid
 *               propertyId:
 *                 type: string
 *                 format: uuid
 *               dealId:
 *                 type: string
 *                 format: uuid
 *             required:
 *               - title
 *               - type
 *     responses:
 *       200:
 *         description: Created task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 */

/**
 * @swagger
 * /api/tasks/{id}:
 *   patch:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - SessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               priority:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Updated task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - SessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 */

// Communication Routes
/**
 * @swagger
 * /api/communications:
 *   get:
 *     summary: Get all communications with optional filtering
 *     tags: [Communications]
 *     security:
 *       - SessionAuth: []
 *     parameters:
 *       - in: query
 *         name: leadId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter communications by lead ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [email, sms, call, meeting, note]
 *         description: Filter communications by type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, sent, delivered, read, replied, failed, scheduled]
 *         description: Filter communications by status
 *     responses:
 *       200:
 *         description: List of communications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Communication'
 *   post:
 *     summary: Create a new communication record
 *     tags: [Communications]
 *     security:
 *       - SessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leadId:
 *                 type: string
 *                 format: uuid
 *               type:
 *                 type: string
 *                 enum: [email, sms, call, meeting, note]
 *               direction:
 *                 type: string
 *                 enum: [inbound, outbound]
 *               subject:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, sent, delivered, read, replied, failed, scheduled]
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *             required:
 *               - leadId
 *               - type
 *               - content
 *     responses:
 *       200:
 *         description: Created communication
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Communication'
 */

// Notification Routes
/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - SessionAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *         description: Get only unread notifications
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [lead, task, deal, system, reminder]
 *         description: Filter notifications by type
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 */

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get count of unread notifications
 *     tags: [Notifications]
 *     security:
 *       - SessionAuth: []
 *     responses:
 *       200:
 *         description: Unread notification count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 */

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - SessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */

// AI Service Routes
/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: AI-powered chat for contextual assistance
 *     tags: [AI Services]
 *     security:
 *       - SessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: User's question or request
 *               context:
 *                 type: object
 *                 description: Additional context (current page, selected items, etc.)
 *             required:
 *               - message
 *     responses:
 *       200:
 *         description: AI response with contextual assistance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: string
 *                 actionItems:
 *                   type: array
 *                   items:
 *                     type: object
 */

/**
 * @swagger
 * /api/ai/insights:
 *   get:
 *     summary: Get AI-powered insights and recommendations
 *     tags: [AI Services]
 *     security:
 *       - SessionAuth: []
 *     responses:
 *       200:
 *         description: AI insights and recommendations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AIInsight'
 */

/**
 * @swagger
 * /api/ai/generate-message:
 *   post:
 *     summary: Generate personalized messages using AI
 *     tags: [AI Services]
 *     security:
 *       - SessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leadId:
 *                 type: string
 *                 format: uuid
 *               type:
 *                 type: string
 *                 enum: [email, sms, call_script]
 *               purpose:
 *                 type: string
 *                 enum: [introduction, follow_up, appointment, offer, closing]
 *               tone:
 *                 type: string
 *                 enum: [professional, friendly, urgent, casual]
 *             required:
 *               - leadId
 *               - type
 *               - purpose
 *     responses:
 *       200:
 *         description: Generated personalized message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subject:
 *                   type: string
 *                 content:
 *                   type: string
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: string
 */

/**
 * @swagger
 * /api/ai/property-match:
 *   post:
 *     summary: Find properties matching lead preferences using AI
 *     tags: [AI Services]
 *     security:
 *       - SessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leadId:
 *                 type: string
 *                 format: uuid
 *               maxResults:
 *                 type: integer
 *                 default: 5
 *             required:
 *               - leadId
 *     responses:
 *       200:
 *         description: AI-matched properties with compatibility scores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   property:
 *                     $ref: '#/components/schemas/Property'
 *                   matchScore:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 100
 *                   reasons:
 *                     type: array
 *                     items:
 *                       type: string
 */

// Object Storage Routes
/**
 * @swagger
 * /api/objects/signed-url:
 *   post:
 *     summary: Get signed URL for file upload
 *     tags: [Object Storage]
 *     security:
 *       - SessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileName:
 *                 type: string
 *               fileType:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *                 default: false
 *             required:
 *               - fileName
 *               - fileType
 *     responses:
 *       200:
 *         description: Signed URL for file upload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploadUrl:
 *                   type: string
 *                   format: uri
 *                 downloadUrl:
 *                   type: string
 *                   format: uri
 *                 objectKey:
 *                   type: string
 */

/**
 * @swagger
 * /api/objects/{objectKey}:
 *   get:
 *     summary: Get object download URL
 *     tags: [Object Storage]
 *     security:
 *       - SessionAuth: []
 *     parameters:
 *       - in: path
 *         name: objectKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Object storage key
 *     responses:
 *       200:
 *         description: Object download URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 downloadUrl:
 *                   type: string
 *                   format: uri
 *       404:
 *         description: Object not found
 *   delete:
 *     summary: Delete an object
 *     tags: [Object Storage]
 *     security:
 *       - SessionAuth: []
 *     parameters:
 *       - in: path
 *         name: objectKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Object storage key
 *     responses:
 *       200:
 *         description: Object deleted successfully
 *       404:
 *         description: Object not found
 */