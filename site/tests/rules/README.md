# Firestore rules tests (the counters)

Needs Java 17+ on the machine (the Firestore emulator is a Java program).

```bash
cd site
cat > /tmp/firebase.json <<'JSON'
{ "firestore": { "rules": "firestore.rules" }, "emulators": { "firestore": { "port": 8089 }, "ui": { "enabled": false } } }
JSON
npm i --no-save --legacy-peer-deps @firebase/rules-unit-testing firebase@10 firebase-tools
npx firebase emulators:exec --config /tmp/firebase.json --only firestore --project demo-cizle "node tests/rules/stats.rules.test.mjs"
```

It checks: anyone can read a counter; a view can be +1 without signing in; a like or bookmark needs sign-in; +2, below zero, extra fields and deletes are refused;
the subscribers and users rules still behave as before. Deploy with `firebase deploy --only firestore:rules` only after this passes.
