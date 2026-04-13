-- RLS for teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read teams"
  ON public.teams FOR SELECT
  USING (true);

CREATE POLICY "Team leader can insert"
  ON public.teams FOR INSERT
  WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Team leader can update"
  ON public.teams FOR UPDATE
  USING (auth.uid() = leader_id);

CREATE POLICY "Team leader can delete"
  ON public.teams FOR DELETE
  USING (auth.uid() = leader_id);

CREATE POLICY "Admin full access teams"
  ON public.teams FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS for team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read team_members"
  ON public.team_members FOR SELECT
  USING (true);

CREATE POLICY "Team leader can manage members"
  ON public.team_members FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid())
  );

CREATE POLICY "Team leader can update members"
  ON public.team_members FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid())
  );

CREATE POLICY "Team leader can remove members"
  ON public.team_members FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid())
  );

CREATE POLICY "Admin full access team_members"
  ON public.team_members FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS for team_careers
ALTER TABLE public.team_careers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read public team_careers"
  ON public.team_careers FOR SELECT
  USING (true);

CREATE POLICY "Team leader can insert team_careers"
  ON public.team_careers FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid())
  );

CREATE POLICY "Team leader can update team_careers"
  ON public.team_careers FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid())
  );

CREATE POLICY "Team leader can delete team_careers"
  ON public.team_careers FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid())
  );

CREATE POLICY "Admin full access team_careers"
  ON public.team_careers FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS for dancer_agencies
ALTER TABLE public.dancer_agencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read dancer_agencies"
  ON public.dancer_agencies FOR SELECT
  USING (true);

CREATE POLICY "Dancer owner/manager can manage agencies"
  ON public.dancer_agencies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dancers
      WHERE id = dancer_id AND (owner_id = auth.uid() OR manager_id = auth.uid())
    )
  );

CREATE POLICY "Dancer owner/manager can update agencies"
  ON public.dancer_agencies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.dancers
      WHERE id = dancer_id AND (owner_id = auth.uid() OR manager_id = auth.uid())
    )
  );

CREATE POLICY "Dancer owner/manager can remove agencies"
  ON public.dancer_agencies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.dancers
      WHERE id = dancer_id AND (owner_id = auth.uid() OR manager_id = auth.uid())
    )
  );

CREATE POLICY "Admin full access dancer_agencies"
  ON public.dancer_agencies FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );
