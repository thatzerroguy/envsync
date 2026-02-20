import sql from "./init";

/**
 * @description - To initialize schema
 */
export async function initializeSchema() {
  
  // Create users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      
      public_key TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;
  
  // Create projects table
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;
  
  // Create project_members table
  await sql`
    CREATE TABLE IF NOT EXISTS project_members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      
      UNIQUE(project_id, user_id)
    );
  `;
  
  // Create secrets table
  // Value is encrypted using AES-256-GCM
  await sql`
    CREATE TABLE IF NOT EXISTS secrets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      environment_id UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      
      UNIQUE(project_id, environment_id, key)
    );
  `;
   
  // Create project keys table
  await sql`
    CREATE TABLE IF NOT EXISTS project_keys (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      key TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;
  
  // Create environment table
  await sql`
    CREATE TABLE IF NOT EXISTS environments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      
      UNIQUE(project_id, name)
    );
  `;
  
  // Create index on secrets table for faster lookups
  await sql`
    CREATE INDEX IF NOT EXISTS idx_secrets_project_id_environment_id_key ON secrets(project_id, environment_id, key);
  `;

  // Create index on project keys table for faster lookups
  await sql`
    CREATE INDEX IF NOT EXISTS idx_project_keys_project_id_user_id ON project_keys(project_id, user_id);
  `;
  
  console.log('Database schema created successfully');
}

// Database Operations

/**
 * @description create user
 * @param email 
 * @param public_key 
 * @returns 
 */
export async function createUser(email: string, public_key: string) {
    const [user] = await sql`
      INSERT INTO users (email, public_key)
      VALUES (${email}, ${public_key})
      RETURNING *;
    `;
    return user
}

/**
 * @description - initialize project
 * @param name 
 * @param owner_id 
 * @returns 
 */
export async function createProject(name: string, owner_id: string) {
    const [project] = await sql`
      INSERT INTO projects (name, owner_id)
      VALUES (${name}, ${owner_id})
      RETURNING *;
    `;
    return project;
}

// Create project key
export async function createProjectKey(project_id: string, user_id: string) {
    const [projectKey] = await sql`
      INSERT INTO project_keys (project_id, user_id)
      VALUES (${project_id}, ${user_id})
      RETURNING *;
    `;
    return projectKey;
}

// Create environment
export async function createEnvironment(project_id: string, name: string) {
    const [environment] = await sql`
      INSERT INTO environments (project_id, name)
      VALUES (${project_id}, ${name})
      RETURNING *;
    `;
    return environment;
}

// Set secrets
export async function setSecret(project_id: string, environment_id: string, key: string, value: string) {
  const [secret] = await sql`
    INSERT INTO secrets (project_id, environment_id, key, value)
    VALUES (${project_id}, ${environment_id}, ${key}, ${value})
    RETURNING key;
    `;
  return secret;
}