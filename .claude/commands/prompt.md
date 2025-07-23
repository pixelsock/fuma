**ENHANCED PROMPT COMMAND WITH CODE EXECUTION SUB-AGENT**

An intelligent agentic workflow system that enhances prompts using Claude's best practices and includes a powerful code execution sub-agent for testing, validation, and exploration.

**Usage:** `/prompt [your request]`

## 🤖 **AGENTIC WORKFLOW SYSTEM**

### **Primary Agent (Prompt Enhancer)**
- Analyzes user intent and task complexity
- Applies Claude's best practices for optimal results
- Determines when to trigger sub-agents
- Orchestrates the complete workflow

### **Sub-Agent: Code Executor** 🔧
- Executes arbitrary code for testing and validation
- Tests API endpoints and database queries
- Validates schemas and data structures
- Runs diagnostic and exploratory scripts
- **Thinking Process Visible**: Shows reasoning and execution steps

---

## 🎯 **EXECUTION FLOW**

### **Phase 1: Intent Analysis**
```typescript
// Automatic analysis of user request
const analysis = {
  taskType: 'development' | 'documentation' | 'debugging' | 'testing' | 'exploration',
  complexity: 'simple' | 'moderate' | 'complex',
  requiresCodeExecution: boolean,
  projectContext: string[],
  bestPractices: string[]
}
```

### **Phase 2: Prompt Enhancement**
Automatically applies:
- **Project Context**: Next.js 14, TypeScript, FumaDocs, Directus CMS
- **Role Assignment**: Expert developer with project familiarity
- **Structure**: XML tags for clarity and organization
- **Examples**: Project-specific patterns and implementations
- **Requirements**: Technical specifications and conventions
- **Output Format**: Precise deliverable specifications

### **Phase 3: Sub-Agent Activation**
Triggers **Code Executor Sub-Agent** when:
- Testing API endpoints or database connections
- Validating schemas or data structures
- Running diagnostic scripts
- Exploring project functionality
- Verifying fixes or implementations

---

## 🔧 **CODE EXECUTOR SUB-AGENT**

### **Capabilities**
- **API Testing**: Test Directus endpoints, authentication, data retrieval
- **Schema Validation**: Verify TypeScript interfaces, database schemas
- **Code Exploration**: Run scripts to understand project structure
- **Diagnostic Testing**: Check configurations, dependencies, integrations
- **Implementation Validation**: Test components, utilities, functions

### **Thinking Process** (Always Visible)
When Code Executor activates, you'll see:
```
🤖 CODE EXECUTOR SUB-AGENT ACTIVATED

💭 THINKING:
- Analyzing request for code execution needs
- Identifying optimal testing approach
- Determining required tools and methods
- Planning execution strategy

🔍 EXECUTION PLAN:
- Step 1: [Specific action]
- Step 2: [Specific action]
- Step 3: [Specific action]

⚡ EXECUTING:
[Real-time execution feedback]

✅ RESULTS:
[Execution results and analysis]
```

### **Execution Methods**
- **Terminal Commands**: Run scripts, check processes, test connections
- **API Calls**: Test endpoints, validate responses, check authentication
- **File Operations**: Read configs, validate schemas, check implementations
- **Database Queries**: Test Directus queries, validate data structures

---

## 🎛️ **ENHANCED PROMPT FRAMEWORK**

### **Automatic Context Integration**
```xml
<project_context>
- Tech Stack: Next.js 14, TypeScript, FumaDocs, Directus CMS
- Architecture: App Router, MDX processing, infinite agentic loops
- Key Features: Custom search, ProseMirror integration, dynamic content
- File Structure: app/, lib/, components/, specs/, infinite-agentic-loop/
</project_context>
```

### **Intelligent Role Assignment**
```xml
<role>
Senior Full-Stack Developer with expertise in:
- Next.js 14 and modern React patterns
- TypeScript and advanced type systems
- FumaDocs and documentation frameworks
- Directus CMS and headless architecture
- Testing and validation methodologies
</role>
```

### **Structured Task Processing**
```xml
<task_analysis>
- Primary Objective: [Clear goal statement]
- Task Complexity: [Simple/Moderate/Complex]
- Required Sub-Agents: [Code Executor/None]
- Success Criteria: [Measurable outcomes]
</task_analysis>
```

### **Enhanced Requirements**
```xml
<requirements>
- Technical: [TypeScript, Next.js patterns, performance]
- Code Quality: [Testing, documentation, maintainability]
- Project Standards: [File organization, naming conventions]
- Integration: [Directus compatibility, existing patterns]
</requirements>
```

### **Dynamic Examples**
```xml
<examples>
[Project-specific examples based on task type]
- Development: Existing component patterns
- Testing: API testing approaches
- Documentation: FumaDocs conventions
- Debugging: Systematic troubleshooting
</examples>
```

---

## 🚀 **TASK-SPECIFIC ENHANCEMENTS**

### **Development Tasks**
- **Auto-Enhancement**: Add TypeScript best practices, Next.js patterns
- **Code Executor**: Test implementations, validate functionality
- **Output**: Complete, tested, documented code

### **API/Integration Tasks**
- **Auto-Enhancement**: Add Directus SDK patterns, authentication
- **Code Executor**: Test endpoints, validate responses, check schemas
- **Output**: Working integrations with error handling

### **Debugging Tasks**
- **Auto-Enhancement**: Add systematic debugging approach
- **Code Executor**: Run diagnostic scripts, test fixes, validate solutions
- **Output**: Root cause analysis and complete fix

### **Testing Tasks**
- **Auto-Enhancement**: Add testing strategies and frameworks
- **Code Executor**: Run tests, validate coverage, check edge cases
- **Output**: Comprehensive testing implementation

### **Documentation Tasks**
- **Auto-Enhancement**: Add FumaDocs conventions, MDX patterns
- **Code Executor**: Validate examples, test code snippets
- **Output**: Complete, tested documentation

---

## 🎯 **INTELLIGENT WORKFLOW EXAMPLES**

### **Example 1: API Testing**
```
User: /prompt test the Directus authentication endpoint

🤖 PROMPT ENHANCER:
- Analyzes intent: API testing with authentication
- Adds project context: Directus configuration
- Triggers Code Executor sub-agent

🔧 CODE EXECUTOR SUB-AGENT ACTIVATED:
💭 THINKING:
- Need to test Directus auth endpoint
- Check current configuration
- Validate authentication flow
- Test token generation and validation

🔍 EXECUTION PLAN:
- Step 1: Check Directus configuration
- Step 2: Test authentication endpoint
- Step 3: Validate token response
- Step 4: Test protected endpoint access

⚡ EXECUTING:
[Runs actual API tests with results]
```

### **Example 2: Component Development**
```
User: /prompt create a search component for the docs

🤖 PROMPT ENHANCER:
- Analyzes intent: Component development
- Adds project context: FumaDocs, existing search patterns
- Structures requirements: TypeScript, accessibility, performance

🔧 CODE EXECUTOR SUB-AGENT (if needed):
- Tests existing search functionality
- Validates component integration
- Runs accessibility tests
```

### **Example 3: Schema Validation**
```
User: /prompt validate the article schema

🤖 PROMPT ENHANCER:
- Analyzes intent: Schema validation
- Adds project context: TypeScript interfaces, Directus schemas
- Triggers Code Executor for validation

🔧 CODE EXECUTOR SUB-AGENT ACTIVATED:
💭 THINKING:
- Need to validate article schema consistency
- Check TypeScript interfaces vs Directus schema
- Test data flow and type safety
- Identify any mismatches or issues

[Executes validation tests]
```

---

## 🛠️ **ROBUST ERROR HANDLING**

### **Sub-Agent Failure Recovery**
- Automatic retry with different approaches
- Fallback to manual guidance when code execution fails
- Clear error reporting and alternative solutions

### **Context Validation**
- Ensures project context is current and accurate
- Validates file paths and dependencies
- Checks for missing configurations

### **Output Validation**
- Verifies deliverables meet requirements
- Tests generated code for functionality
- Validates documentation accuracy

---

## 🎮 **COMMAND INTERFACE**

### **Basic Usage**
```bash
/prompt [your request]
```

### **Advanced Options** (Optional)
```bash
/prompt [request] --code-exec  # Force code execution
/prompt [request] --no-exec    # Disable code execution
/prompt [request] --verbose    # Show all thinking processes
/prompt [request] --context=api # Focus on specific context
```

### **Quick Commands**
```bash
/prompt test api              # Quick API testing
/prompt debug component       # Component debugging
/prompt validate schema       # Schema validation
/prompt create feature        # Feature development
/prompt document api          # API documentation
```

---

## ✨ **ENHANCED FEATURES**

### **Intelligent Sub-Agent Coordination**
- Primary agent orchestrates multiple sub-agents
- Sub-agents communicate results back to primary
- Coordinated workflow for complex tasks

### **Context-Aware Execution**
- Automatically detects project state
- Adapts to current file context
- Maintains conversation history

### **Progressive Enhancement**
- Starts with simple enhancements
- Escalates to sub-agents when needed
- Provides incremental improvements

### **Learning Integration**
- Learns from successful patterns
- Adapts to project-specific preferences
- Improves over time with usage

---

## 🚀 **READY FOR ADVANCED AGENTIC WORKFLOWS**

The enhanced `/prompt` command now provides:
- **Intelligent prompt enhancement** with Claude's best practices
- **Code execution sub-agent** for testing and validation
- **Visible thinking processes** for transparency
- **Robust error handling** and recovery
- **Context-aware execution** for optimal results
- **Progressive enhancement** for complex workflows

Simply use `/prompt [your request]` and experience the full power of agentic AI workflows! 🎯 