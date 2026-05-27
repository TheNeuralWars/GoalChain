## Summary

Provide a brief description of the changes introduced by this Pull Request.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Checklist

- [ ] My code follows the code style and guidelines of this project
- [ ] I have verified typescript compilations: `npm run lint` or `npx tsc --noEmit`
- [ ] I have verified the build: `npm run build`
- [ ] All related issues are referenced (e.g. `Closes #123`)
- [ ] I am committed to running the post-merge gbrain import ritual below immediately after merge

---

## 🔮 Post-Merge Ritual (Mandatory)

Immediately after this Pull Request is merged into `main`, **you must run the following gbrain sync command** on your local machine (and VPS if applicable) to keep the AI contexts and indexers perfectly synchronized:

```bash
git checkout main && git pull origin main
gbrain import ai_context docs/intake
# On the VPS (if Discord profiles or gateway config changed):
bash ~/hermes/workspace/GoalChain/ops/hermes/sync-hermes-active-profile-discord.sh
systemctl --user restart hermes-gateway
```
