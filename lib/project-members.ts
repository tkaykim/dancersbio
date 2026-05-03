import { supabase } from "@/lib/supabase";
import type { ProjectMember, ProjectMemberRole } from "@/lib/types";

/**
 * 한 프로젝트의 멤버 목록을 가져옴 (user 정보 포함).
 */
export async function fetchProjectMembers(projectId: string): Promise<ProjectMember[]> {
    const { data, error } = await supabase
        .from("project_members")
        .select(
            `id, project_id, user_id, role, added_by, created_at,
             user:users!project_members_user_id_fkey(id, name, email)`
        )
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

    if (error) throw error;
    // supabase 결과 타입 정리
    return (data ?? []).map((row) => {
        const u = (row as { user: unknown }).user;
        const user = Array.isArray(u) ? u[0] : u;
        return { ...(row as Omit<ProjectMember, "user">), user: user ?? null };
    }) as ProjectMember[];
}

/**
 * 현재 로그인 사용자의 이 프로젝트에서의 역할.
 * 멤버가 아니면 null.
 */
export async function fetchMyProjectRole(
    projectId: string,
    userId: string
): Promise<ProjectMemberRole | null> {
    const { data, error } = await supabase
        .from("project_members")
        .select("role")
        .eq("project_id", projectId)
        .eq("user_id", userId)
        .maybeSingle();
    if (error) throw error;
    return (data?.role as ProjectMemberRole | undefined) ?? null;
}

/**
 * 멤버 추가 — manager 또는 viewer만 추가 가능 (owner는 트리거가 자동 관리).
 * RLS가 owner 권한 체크.
 */
export async function addProjectMember(params: {
    projectId: string;
    userId: string;
    role: Extract<ProjectMemberRole, "manager" | "viewer">;
    addedBy: string;
}): Promise<void> {
    const { error } = await supabase.from("project_members").insert({
        project_id: params.projectId,
        user_id: params.userId,
        role: params.role,
        added_by: params.addedBy,
    });
    if (error) throw error;
}

/**
 * 멤버 역할 변경 (manager <-> viewer). owner 변경은 별도 함수로.
 */
export async function updateProjectMemberRole(params: {
    memberId: string;
    role: Extract<ProjectMemberRole, "manager" | "viewer">;
}): Promise<void> {
    const { error } = await supabase
        .from("project_members")
        .update({ role: params.role })
        .eq("id", params.memberId);
    if (error) throw error;
}

/**
 * 멤버 제거. owner는 RLS에 의해 차단됨.
 */
export async function removeProjectMember(memberId: string): Promise<void> {
    const { error } = await supabase
        .from("project_members")
        .delete()
        .eq("id", memberId);
    if (error) throw error;
}

/**
 * 권한 체크 헬퍼들. UI에서 행동 가능 여부 판단용.
 */
export const canManage = (role: ProjectMemberRole | null | undefined): boolean =>
    role === "owner" || role === "manager";

export const isOwner = (role: ProjectMemberRole | null | undefined): boolean =>
    role === "owner";

/**
 * 이메일로 user를 검색하여 user_id를 얻음. 멤버 추가 폼에서 사용.
 */
export async function findUserByEmail(email: string): Promise<{
    id: string;
    name: string | null;
    email: string | null;
} | null> {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return null;
    const { data, error } = await supabase
        .from("users")
        .select("id, name, email")
        .ilike("email", trimmed)
        .maybeSingle();
    if (error) throw error;
    return data ?? null;
}
