import { supabase } from '@/lib/supabase'

export interface CreateClientInput {
  owner_id: string
  company_name: string
  contact_person: string
  type?: 'company' | 'individual' | 'agency'
  business_number?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  description?: string | null
}

export async function findOrCreateClient(
  ownerId: string,
  companyName: string,
  contactPerson: string,
): Promise<string> {
  const trimmedName = companyName.trim()
  if (!trimmedName) throw new Error('회사명을 입력해주세요.')

  const { data: existing } = await supabase
    .from('clients')
    .select('id')
    .eq('owner_id', ownerId)
    .eq('company_name', trimmedName)
    .single()

  if (existing) return existing.id

  const { data: newClient, error } = await supabase
    .from('clients')
    .insert({
      owner_id: ownerId,
      company_name: trimmedName,
      contact_person: contactPerson || '',
    })
    .select('id')
    .single()

  if (error) throw error
  if (!newClient?.id) throw new Error('회사 등록에 실패했습니다.')

  return newClient.id
}

export async function createClientFull(input: CreateClientInput): Promise<string> {
  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      owner_id: input.owner_id,
      company_name: input.company_name.trim() || null,
      contact_person: input.contact_person.trim(),
      type: input.type ?? 'company',
      business_number: input.business_number?.trim() || null,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
      description: input.description?.trim() || null,
    })
    .select('id')
    .single()

  if (error) throw error
  if (!client?.id) throw new Error('회사 등록에 실패했습니다.')

  return client.id
}

export async function updateClient(
  clientId: string,
  input: Partial<Omit<CreateClientInput, 'owner_id'>>,
): Promise<void> {
  const updateData: Record<string, unknown> = {}
  if (input.company_name !== undefined) updateData.company_name = input.company_name.trim() || null
  if (input.contact_person !== undefined) updateData.contact_person = input.contact_person.trim()
  if (input.type !== undefined) updateData.type = input.type
  if (input.business_number !== undefined) updateData.business_number = input.business_number?.trim() || null
  if (input.email !== undefined) updateData.email = input.email?.trim() || null
  if (input.phone !== undefined) updateData.phone = input.phone?.trim() || null
  if (input.address !== undefined) updateData.address = input.address?.trim() || null
  if (input.description !== undefined) updateData.description = input.description?.trim() || null

  const { error } = await supabase
    .from('clients')
    .update(updateData)
    .eq('id', clientId)

  if (error) throw error
}
