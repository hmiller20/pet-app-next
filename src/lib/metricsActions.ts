'use client';

export async function incrementDeathCount(userId: string) {
  try {
    const response = await fetch('/api/metrics/death', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error incrementing death count:', error);
    return false;
  }
}

export async function incrementInteraction(userId: string, type: 'feed' | 'play' | 'heal') {
  try {
    const response = await fetch('/api/metrics/interaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, type }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error incrementing interaction:', error);
    return false;
  }
} 