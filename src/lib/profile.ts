import { supabase } from './supabase'

export interface ProfilePictureUploadResult {
  url: string | null;
  error: any;
}

export const uploadProfilePicture = async (file: File): Promise<ProfilePictureUploadResult> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { url: null, error: { message: 'User not authenticated' } }
    }

    // Create a unique filename with user ID and timestamp
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/profile-${Date.now()}.${fileExt}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      return { url: null, error }
    }

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName)

    return { url: publicUrl, error: null }
  } catch (err) {
    return { url: null, error: { message: 'Failed to upload profile picture' } }
  }
}

export const deleteProfilePicture = async (fileName: string): Promise<{ error: any }> => {
  try {
    const { error } = await supabase.storage
      .from('profile-pictures')
      .remove([fileName])

    return { error }
  } catch (err) {
    return { error: { message: 'Failed to delete profile picture' } }
  }
}

export const getCurrentProfilePicture = async (): Promise<{ url: string | null; error: any }> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { url: null, error: { message: 'User not authenticated' } }
    }

    // List files in user's folder
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .list(user.id, {
        limit: 1,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error || !data || data.length === 0) {
      return { url: null, error: null }
    }

    // Get public URL for the most recent file
    const fileName = `${user.id}/${data[0].name}`
    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName)

    return { url: publicUrl, error: null }
  } catch (err) {
    return { url: null, error: { message: 'Failed to get profile picture' } }
  }
}