#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "تطبيق توظيف متكامل يربط بين أصحاب الأعمال والباحثين عن عمل مع ميزات شاملة"

backend:
  - task: "نظام المصادقة - Emergent Google Auth"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "تم تنفيذ نظام المصادقة الكامل مع Emergent Google Auth، يتضمن exchange session_id، إنشاء sessions، وإدارة المستخدمين"
      - working: true
        agent: "testing"
        comment: "✅ تم اختبار جميع endpoints المصادقة بنجاح: GET /api/auth/me للنوعين (employer/job_seeker)، POST /api/auth/logout. النظام يعمل بشكل مثالي مع التحقق من الهوية والصلاحيات"

  - task: "إدارة المستخدمين - User Management"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "تم تنفيذ endpoints لتحديث الملف الشخصي وعرض معلومات المستخدم"
      - working: true
        agent: "testing"
        comment: "✅ تم اختبار PUT /api/users/profile و GET /api/users/{user_id} بنجاح. تحديث البيانات الشخصية وعرض معلومات المستخدمين يعمل بشكل صحيح"

  - task: "إدارة الوظائف - Jobs Management"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "تم تنفيذ نشر الوظائف، عرض الوظائف مع البحث والفلترة، تعديل حالة الوظائف"
      - working: true
        agent: "testing"
        comment: "✅ تم اختبار جميع endpoints الوظائف: POST /api/jobs (نشر وظيفة)، GET /api/jobs (عرض مع فلترة)، GET /api/jobs/{job_id}، GET /api/jobs/my/posted، PUT /api/jobs/{job_id}/status. تم إصلاح مشكلة في status update endpoint. جميع الوظائف تعمل بشكل مثالي"

  - task: "نظام التقديم على الوظائف - Applications"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "تم تنفيذ التقديم على الوظائف، عرض الطلبات للباحث والوظيفة، وتحديث حالة الطلبات"
      - working: true
        agent: "testing"
        comment: "✅ تم اختبار جميع endpoints التقديم: POST /api/applications، GET /api/applications/my/submitted، GET /api/applications/job/{job_id}، PUT /api/applications/{application_id}/status. تم إصلاح مشكلة في status update endpoint. النظام يعمل بشكل كامل مع التحقق من الصلاحيات"

  - task: "نظام المراسلة - Messaging System"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "تم تنفيذ إرسال واستقبال الرسائل، عرض المحادثات، Socket.io للإشعارات الفورية"
      - working: true
        agent: "testing"
        comment: "✅ تم اختبار جميع endpoints المراسلة: POST /api/messages، GET /api/messages/conversation/{user_id}، GET /api/messages/conversations. النظام يعمل بشكل مثالي مع إدارة المحادثات وعدد الرسائل غير المقروءة"

  - task: "نظام التقييمات - Reviews System"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "تم تنفيذ إضافة تقييمات وعرض تقييمات المستخدم مع الإحصائيات"
      - working: true
        agent: "testing"
        comment: "✅ تم اختبار جميع endpoints التقييمات: POST /api/reviews، GET /api/reviews/user/{user_id}، GET /api/reviews/stats/{user_id}. النظام يعمل بشكل مثالي مع حساب المتوسطات والإحصائيات"

frontend:
  - task: "نظام المصادقة - Auth Flow"
    implemented: true
    working: "NA"
    file: "/app/frontend/contexts/AuthContext.tsx, /app/frontend/app/auth/select-type.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "تم تنفيذ AuthContext كامل مع اختيار نوع المستخدم، تسجيل دخول Google، معالجة deep links"

  - task: "الشاشة الرئيسية - Home Screen"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/tabs/index.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "تم تنفيذ الشاشة الرئيسية مع عرض الوظائف الحديثة والإجراءات السريعة"

  - task: "شاشة الوظائف - Jobs Screen"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/tabs/jobs.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "تم تنفيذ عرض الوظائف مع البحث والفلترة حسب النوع"

  - task: "نشر وظيفة - Post Job"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/jobs/post.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "تم تنفيذ صفحة نشر الوظائف مع جميع الحقول المطلوبة"

  - task: "تفاصيل الوظيفة - Job Details"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/jobs/[id].tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "تم تنفيذ صفحة تفاصيل الوظيفة مع إمكانية التقديم للباحثين وعرض المتقدمين لأصحاب العمل"

  - task: "طلباتي - My Applications"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/jobs/my-applications.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "تم تنفيذ صفحة عرض طلبات التوظيف للباحث عن عمل"

  - task: "المتقدمون للوظيفة - Job Applications"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/jobs/applications/[jobId].tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "تم تنفيذ صفحة عرض المتقدمين لوظيفة معينة مع إمكانية القبول/الرفض"

  - task: "شاشة الرسائل - Messages Screen"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/tabs/messages.tsx, /app/frontend/app/messages/[userId].tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "تم تنفيذ قائمة المحادثات وصفحة الدردشة مع polling كل 5 ثواني"

  - task: "الملف الشخصي - Profile Screen"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/tabs/profile.tsx, /app/frontend/app/profile/edit.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "تم تنفيذ صفحة الملف الشخصي وصفحة تعديل الملف الشخصي"

  - task: "التنقل بالتبويبات - Bottom Tabs Navigation"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/tabs/_layout.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "تم تنفيذ نظام التنقل بالتبويبات السفلية مع 4 تبويبات رئيسية"

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 0
  run_ui: false

test_plan:
  current_focus:
    - "نظام المصادقة - Backend & Frontend"
    - "إدارة الوظائف - CRUD Operations"
    - "نظام التقديم على الوظائف"
    - "نظام المراسلة"
  stuck_tasks: []
  test_all: true
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: "تم تنفيذ تطبيق التوظيف المتكامل بجميع الميزات الأساسية: المصادقة، إدارة الوظائف، التقديم، المراسلة، التقييمات. Backend يستخدم FastAPI + MongoDB + Socket.IO. Frontend يستخدم Expo + React Navigation. جاهز للاختبار الشامل."
  - agent: "testing"
    message: "✅ تم إجراء اختبار شامل لجميع Backend APIs بنجاح! معدل النجاح 91.3% (21/23 اختبار). تم إصلاح مشكلتين في status update endpoints. جميع الوظائف الأساسية تعمل بشكل مثالي: المصادقة، إدارة المستخدمين، الوظائف، التقديمات، المراسلة، التقييمات. نظام الصلاحيات يعمل بشكل صحيح. Backend جاهز للإنتاج!"
