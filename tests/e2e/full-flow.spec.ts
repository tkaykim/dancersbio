/**
 * E2E: 클라이언트 → Deukie 제안 → Deukie 수락 → 테스트 댄서 초대 → 테스트 댄서 수락
 * 이후 매출/지출/순이익, 프로젝트 상태, 보관, 엠바고→공개까지 검증.
 *
 * 계정 (.cursor/forplaywrighttest.mdc):
 * - 클라이언트: client@client.com / 123123
 * - Deukie(테스트 대상 댄서): tommy0621@naver.com / 123123
 * - testdancer(서브 댄서): test@dance.com / 123123
 */

import { test, expect } from '@playwright/test'

const CLIENT = { email: 'client@client.com', password: '123123' }
const DEUKIE = { email: 'tommy0621@naver.com', password: '123123' }
const TEST_DANCER = { email: 'test@dance.com', password: '123123' }

async function signIn(page: import('@playwright/test').Page, email: string, password: string) {
    await page.goto('/auth/signin')
    await page.getByLabel('이메일').fill(email)
    await page.getByLabel('비밀번호').fill(password)
    await page.getByRole('button', { name: '로그인' }).click()
    await expect(page).not.toHaveURL(/\/auth\/signin/, { timeout: 15000 })
}

async function signOut(page: import('@playwright/test').Page) {
    await page.goto('/my/settings')
    page.once('dialog', (d) => d.accept())
    await page.getByRole('button', { name: '로그아웃' }).click()
    await expect(page).toHaveURL(/\/(auth\/signin)?$/, { timeout: 10000 })
}

test.describe('전체 시나리오: 제안 → 수락 → 테스트 댄서 초대·수락 → 재무·상태·보관·엠바고', () => {
    test('클라이언트가 Deukie에게 제안 → Deukie 수락 → testdancer 초대·수락 → 재무·상태·보관·엠바고·공개', async ({ page }) => {
        test.setTimeout(180000)
        // ─── 1. 클라이언트 로그인 → Deukie에게 제안 (새 프로젝트) ───
        await signIn(page, CLIENT.email, CLIENT.password)
        await page.goto('/my/proposals/new')
        await page.waitForLoadState('domcontentloaded')
        await page.getByPlaceholder('예: 뮤직비디오 안무 제작').waitFor({ state: 'visible', timeout: 10000 })

        await page.getByPlaceholder('예: 뮤직비디오 안무 제작').fill('E2E 테스트 프로젝트')
        await page.getByPlaceholder('선택사항').first().fill('테스트 회사')
        const dancerSearchBtn = page.getByRole('button', { name: '댄서 검색' })
        if (await dancerSearchBtn.isVisible()) await dancerSearchBtn.click()
        const searchInput = page.getByPlaceholder('이름, 장르, 지역으로 검색...')
        await searchInput.waitFor({ state: 'visible', timeout: 5000 })
        await searchInput.fill('Deukie')
        await page.waitForTimeout(1000)
        const deukieRow = page.locator('button').filter({ hasText: 'Deukie' }).first()
        await deukieRow.click()
        await page.getByLabel(/제안 금액/).fill('500000')
        await page.getByPlaceholder('예: 메인 댄서').fill('메인 안무가')
        page.once('dialog', (d) => d.accept())
        await page.getByRole('button', { name: /명에게 제안 보내기|제안 보내기/ }).click()
        await page.waitForTimeout(2000)
        await expect(page).toHaveURL(/\/my\/proposals/)

        await page.goto('/my/projects')
        await page.waitForLoadState('networkidle')
        const projectLinkByTitle = page.locator('a[href^="/my/projects/"]').filter({ hasText: 'E2E 테스트' }).first()
        await projectLinkByTitle.click()
        await expect(page).toHaveURL(/\/my\/projects\/[a-f0-9-]+$/)

        // ─── 2. Deukie(댄서) 로그인 → 제안 수락 ───
        await signOut(page)
        await signIn(page, DEUKIE.email, DEUKIE.password)
        await page.goto('/my/proposals')
        await page.waitForLoadState('networkidle')
        await page.getByText('E2E 테스트 프로젝트').first().click()
        await page.waitForTimeout(500)
        page.once('dialog', (d) => d.accept())
        await page.getByRole('button', { name: '수락하기' }).click()
        await page.waitForTimeout(1500)

        // Deukie: 내 프로젝트에서 해당 프로젝트 열기 → 댄서 초대
        await page.goto('/my/projects')
        await page.waitForLoadState('networkidle')
        const projectLink = page.locator('a[href*="/my/projects/"]').filter({ hasText: 'E2E 테스트' }).first()
        await projectLink.click()
        await page.getByRole('link', { name: /댄서 초대하기|안무가에게 제안/ }).click()
        await page.waitForLoadState('networkidle')
        await page.getByRole('button', { name: '검색하여 찾기' }).click().catch(() => {})
        await page.getByPlaceholder('이름, 장르, 지역 검색...').fill('testdancer')
        await page.waitForTimeout(800)
        const testdancerRow = page.locator('button').filter({ hasText: /testdancer|test dancer/i }).first()
        await testdancerRow.click()
        await page.getByPlaceholder('금액 (원)').fill('200000')
        page.once('dialog', (d) => d.accept())
        await page.getByRole('button', { name: /명에게 제안 보내기/ }).click()
        await page.waitForTimeout(2000)
        await expect(page).toHaveURL(/\/my\/projects\/[\w-]+$/)

        // ─── 3. 테스트 댄서 로그인 → 제안 수락 ───
        await signOut(page)
        await signIn(page, TEST_DANCER.email, TEST_DANCER.password)
        await page.goto('/my/proposals')
        await page.waitForLoadState('networkidle')
        page.once('dialog', (d) => d.accept())
        await page.getByText('E2E 테스트 프로젝트').first().click()
        await page.waitForTimeout(500)
        page.once('dialog', (d) => d.accept())
        await page.getByRole('button', { name: '수락하기' }).click()
        await page.waitForTimeout(1500)

        // ─── 4. Deukie(PM)으로 재접속 → 프로젝트 상세에서 매출/지출/순이익·상태·보관 확인 ───
        await signOut(page)
        await signIn(page, DEUKIE.email, DEUKIE.password)
        await page.goto('/my/projects')
        await page.waitForLoadState('networkidle')
        await page.locator('a[href*="/my/projects/"]').filter({ hasText: 'E2E 테스트' }).first().click()
        await page.waitForLoadState('networkidle')

        const financeSection = page.getByText('재무').first()
        await financeSection.click()
        await expect(page.getByText(/매출|지출|순익/)).toBeVisible({ timeout: 5000 })

        await expect(page.getByText(/확정|모집 중|진행 중|협상/).first()).toBeVisible({ timeout: 5000 })

        page.once('dialog', (d) => d.accept())
        await page.getByRole('button', { name: '보관하기' }).click()
        await page.waitForTimeout(800)
        await expect(page).toHaveURL(/\?view=archived|view=archived/)
        await page.goto('/my/projects?view=archived')
        await page.waitForLoadState('networkidle')
        await page.locator('a[href*="/my/projects/"]').filter({ hasText: 'E2E 테스트' }).first().click()
        await page.getByRole('button', { name: '보관 해제' }).click()
        await page.waitForTimeout(500)

        // ─── 5. 클라이언트(오너) 로그인 → 엠바고 설정 후 공개 처리 ───
        await signOut(page)
        await signIn(page, CLIENT.email, CLIENT.password)
        await page.goto('/my/projects')
        await page.locator('a[href*="/my/projects/"]').filter({ hasText: 'E2E 테스트' }).first().click()
        await page.waitForLoadState('networkidle')

        await page.getByText('공개 설정').first().click()
        const embargoInput = page.locator('input[type="date"]').first()
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 1)
        const dateStr = futureDate.toISOString().slice(0, 10)
        await embargoInput.fill(dateStr)
        page.once('dialog', (d) => d.accept())
        await page.getByRole('button', { name: '적용' }).click()
        await page.waitForTimeout(800)
        await expect(page.getByText(/엠바고|비공개/).first()).toBeVisible({ timeout: 5000 })

        await page.getByText('공개 설정').first().click()
        const toggleBtn = page.getByRole('button', { name: /공개로|비공개로|엠바고 중/ })
        if (await toggleBtn.isDisabled()) {
            await expect(page.getByText(/엠바고/).first()).toBeVisible()
        } else {
            page.once('dialog', (d) => d.accept())
            await toggleBtn.click()
            await page.waitForTimeout(800)
        }
    })
})
