-- 063: Add video_url to bestvip77_posts for short-form video embeds
alter table public.bestvip77_posts
  add column if not exists video_url text not null default '';

comment on column public.bestvip77_posts.video_url
  is 'Short video URL (MP4 direct link, YouTube Shorts, etc.) shown in the merchant detail view';
