export interface Admin {
    id: string
    user_id: string
    username: string
    email: string
    is_admin: boolean
    is_super_admin: boolean
    department: string
    job_title: string
    is_active: boolean
    created_at: string
    last_admin_login: string | null
    deactivated_at: string | null
    deactivation_reason: string | null
  }
  
  export interface CreateAdminData {
    username: string
    email: string
    password: string
    department: string
    job_title: string
  }
  
  export interface UpdateAdminRoleData {
    is_super_admin: boolean
  }
  
  export interface GetAdminsParams {
    include_deactivated?: boolean
    include_self?: boolean
  }
  