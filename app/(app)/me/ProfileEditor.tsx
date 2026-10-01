"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/Field";
import { copy } from "@/lib/copy";
import { updateProfileAction } from "./_actions";

export function ProfileEditor({ displayName, bio }: { displayName: string; bio: string }) {
  const [name, setName] = useState(displayName);
  const [about, setAbout] = useState(bio);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const dirty = name !== displayName || about !== bio;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const res = await updateProfileAction({ displayName: name, bio: about });
          if (!res.ok) return setError(res.error);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        });
      }}
    >
      <div>
        <Label htmlFor="dn">{copy.auth.name}</Label>
        <Input id="dn" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="bio" optional={`${about.length}/280`}>{copy.profile.bio}</Label>
        <Textarea id="bio" rows={3} maxLength={280} value={about} onChange={(e) => setAbout(e.target.value)} placeholder={copy.profile.bioPlaceholder} />
      </div>
      <FieldError>{error}</FieldError>
      <Button type="submit" variant="dark" disabled={!dirty} loading={pending}>
        {saved ? <><Check className="h-4 w-4" /> {copy.profile.saved}</> : copy.profile.save}
      </Button>
    </form>
  );
}
