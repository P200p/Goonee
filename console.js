// main.js — demo initializer moved from JS/demo/panel-with-tools.html
// Exposes window.initToolsPanelDemo() which builds a jsPanel tools panel and snippet buttons.
(function () {
    window.initToolsPanelDemo = function () {
      try {
        if (typeof jsPanel === "undefined") {
          console.warn(
            "jsPanel not found; load jsPanel before calling initToolsPanelDemo"
          );
          return;
        }
  
        // avoid double-creation
        if (document.getElementById("tools-panel")) return;
  
        // create the main tools panel
        const toolsPanel = jsPanel.create({
          id: "tools-panel",
          headerTitle: "Tools Panel",
          theme: "primary",
          contentSize: "680 380",
          position: "center",
          headerControls: {
            close: true,
            normalize: true,
            smallify: true,
            maximize: true,
          },
          contentOverflow: "auto",
          resizeit: { handles: "n, e, s, w, ne, se, sw, nw" },
          dragit: { handle: ".jsPanel-hdr" },
        });
  
        // inject a small header toolbar
        (function addHeaderToolbar(panel) {
          const el = panel.node || panel;
          const hdr = el.querySelector(".jsPanel-hdr");
          if (!hdr) return;
          const toolbar = document.createElement("div");
          toolbar.className = "hdr-toolbar";
          toolbar.innerHTML = `
                  <button class="hdr-btn" id="hdr-smallify" title="Smallify">▣</button>
                  <button class="hdr-btn" id="hdr-minimize" title="Minimize">—</button>
                  <button class="hdr-btn" id="hdr-browse" title="Browse">📁</button>
                  <button class="hdr-btn" id="hdr-settings" title="Settings">⚙</button>
              `;
          hdr.appendChild(toolbar);
  
          const byId = (id) => el.querySelector("#" + id);
          const smallifyBtn = byId("hdr-smallify");
          const minimizeBtn = byId("hdr-minimize");
          const settingsBtn = byId("hdr-settings");
  
          if (smallifyBtn)
            smallifyBtn.addEventListener("click", () => {
              if (typeof panel.smallify === "function") panel.smallify();
            });
          if (minimizeBtn)
            minimizeBtn.addEventListener("click", () => {
              if (typeof panel.minimize === "function") panel.minimize();
            });
          if (settingsBtn)
            settingsBtn.addEventListener("click", () => {
              if (jsPanel.dialog && jsPanel.dialog.alert) {
                jsPanel.dialog.alert({
                  headerTitle: "Panel Settings",
                  content: "<p>Header settings placeholder.</p>",
                  position: "center",
                });
              }
            });
        })(toolsPanel);
  
        // Fallback pointer-based dragging: attach to header so panel remains draggable
        (function ensureHeaderDrag(panel) {
          try {
            const node = panel.node || panel;
            const header = node.querySelector(".jsPanel-hdr");
            if (!header) return;
            header.style.touchAction = "none";
  
            let activePointerId = null;
            let startX = 0,
              startY = 0,
              startLeft = 0,
              startTop = 0;
  
            header.addEventListener("pointerdown", (e) => {
              // only left mouse button or touch/stylus
              if (e.pointerType === "mouse" && e.button !== 0) return;
              // don't start drag when clicking interactive controls (buttons, inputs)
              const tag = e.target.tagName && e.target.tagName.toLowerCase();
              if (tag === "button" || tag === "input" || tag === "a") return;
  
              header.setPointerCapture(e.pointerId);
              activePointerId = e.pointerId;
  
              const rect = node.getBoundingClientRect();
              // switch to absolute positioning coordinates
              node.style.left = rect.left + "px";
              node.style.top = rect.top + "px";
              node.style.right = "auto";
              node.style.bottom = "auto";
              node.style.transform = "";
  
              startX = e.clientX;
              startY = e.clientY;
              startLeft = rect.left;
              startTop = rect.top;
  
              document.body.style.userSelect = "none";
            });
  
            document.addEventListener("pointermove", (e) => {
              if (activePointerId === null || e.pointerId !== activePointerId)
                return;
              e.preventDefault();
              const dx = e.clientX - startX;
              const dy = e.clientY - startY;
              let newLeft = startLeft + dx;
              let newTop = startTop + dy;
              // basic viewport clamp
              const vw = Math.max(
                document.documentElement.clientWidth,
                window.innerWidth || 0
              );
              const vh = Math.max(
                document.documentElement.clientHeight,
                window.innerHeight || 0
              );
              const elRect = node.getBoundingClientRect();
              const minLeft = -elRect.width + 40;
              const maxLeft = vw - 40;
              const minTop = 0;
              const maxTop = vh - 30;
              newLeft = Math.min(Math.max(newLeft, minLeft), maxLeft);
              newTop = Math.min(Math.max(newTop, minTop), maxTop);
              node.style.left = Math.round(newLeft) + "px";
              node.style.top = Math.round(newTop) + "px";
            });
  
            function endDrag(e) {
              if (activePointerId === null || e.pointerId !== activePointerId)
                return;
              try {
                header.releasePointerCapture(e.pointerId);
              } catch (err) {}
              activePointerId = null;
              document.body.style.userSelect = "";
            }
            document.addEventListener("pointerup", endDrag);
            document.addEventListener("pointercancel", endDrag);
          } catch (err) {
            console.debug("ensureHeaderDrag failed", err);
          }
        })(toolsPanel);
  
        // mini-console behaviors
        (function miniConsoleEnhancements(panel) {
          const key = "toolsPanel-state-v1";
          const node = panel.node || panel;
          const hdr = node.querySelector(".jsPanel-hdr");
          const content = node.querySelector(".jsPanel-content");
  
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const st = JSON.parse(raw);
              if (st.width)
                node.style.width =
                  st.width + (typeof st.width === "number" ? "px" : "");
              if (st.height)
                node.style.height =
                  st.height + (typeof st.height === "number" ? "px" : "");
              if (st.left)
                node.style.left =
                  st.left + (typeof st.left === "number" ? "px" : "");
              if (st.top)
                node.style.top =
                  st.top + (typeof st.top === "number" ? "px" : "");
              if (st.smallified && typeof panel.smallify === "function")
                panel.smallify();
              if (st.minimized && typeof panel.minimize === "function")
                panel.minimize();
            }
          } catch (e) {
            console.debug("restore state failed", e);
          }
  
          if (hdr) {
            hdr.addEventListener("dblclick", () => {
              if (content.style.display === "none") content.style.display = "";
              else content.style.display = "none";
            });
          }
  
          function saveState() {
            try {
              const rect = node.getBoundingClientRect();
              const st = {
                left: node.style.left || Math.round(rect.left) + "px",
                top: node.style.top || Math.round(rect.top) + "px",
                width: node.style.width || Math.round(rect.width) + "px",
                height: node.style.height || Math.round(rect.height) + "px",
                smallified: !!node.classList.contains("jsPanel-smallified"),
                minimized: !!node.classList.contains("jsPanel-minimized"),
              };
              localStorage.setItem(key, JSON.stringify(st));
            } catch (e) {
              console.debug("save state failed", e);
            }
          }
  
          document.addEventListener("pointerup", saveState);
          document.addEventListener("mouseup", saveState);
          window.addEventListener("beforeunload", saveState);
  
          ["close", "minimize", "smallify", "maximize", "normalize"].forEach(
            (fn) => {
              if (typeof panel[fn] === "function") {
                const orig = panel[fn].bind(panel);
                panel[fn] = function () {
                  const res = orig();
                  setTimeout(saveState, 120);
                  return res;
                };
              }
            }
          );
  
          window.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.key === "`") {
              if (typeof panel.smallify === "function") panel.smallify();
            }
          });
        })(toolsPanel);
  
        // build toolbar and tool area
        const toolsHtml = `
        <div class="toolbar">
          <button id="btn-dialog" class="tool-btn">Open Dialog</button>
          <button id="btn-spawn" class="tool-btn">Spawn Child Panel</button>
          <button id="btn-iframe" class="tool-btn">Load Template (iframe)</button>
          <button id="btn-tooltip" class="tool-btn">Show Tooltip</button>
        </div>
        <div id="tool-area">Use the buttons above to open tools inside this panel.</div>
      `;
  
        toolsPanel.content.innerHTML = toolsHtml;
  
        // controlbar
        (function addControlbar(panel) {
          const cb = document.createElement("div");
          cb.className = "panel-controlbar";
          cb.innerHTML = `
                      <button id="cb-open" class="tool-btn">Open dialog</button>
                      <button id="cb-spawn" class="tool-btn">Spawn panel</button>
                      <button id="cb-iframe" class="tool-btn">Load template</button>
                          <button id="cb-browse" class="tool-btn">เรียกดู</button>
                      <div style="flex:1"></div>
                      <button id="cb-close" class="tool-btn">Close</button>
                  `;
          panel.content.appendChild(cb);
          cb.querySelector("#cb-open").addEventListener("click", () =>
            document.getElementById("btn-dialog").click()
          );
          cb.querySelector("#cb-spawn").addEventListener("click", () =>
            document.getElementById("btn-spawn").click()
          );
          cb.querySelector("#cb-iframe").addEventListener("click", () =>
            document.getElementById("btn-iframe").click()
          );
          cb.querySelector("#cb-close").addEventListener("click", () => {
            if (typeof toolsPanel.close === "function") toolsPanel.close();
          });
        })(toolsPanel);
  
        // attach browse
        (function attachBrowse(panel) {
          const fileInput = document.createElement("input");
          fileInput.type = "file";
          fileInput.multiple = true;
          fileInput.accept = "image/*,text/*,application/json";
          fileInput.style.display = "none";
          fileInput.id = "tools-file-input";
          document.body.appendChild(fileInput);
  
          const toolArea = document.getElementById("tool-area");
          function showPreview(files) {
            if (!toolArea) return;
            toolArea.innerHTML = "";
            Array.from(files).forEach((file) => {
              const wrap = document.createElement("div");
              wrap.style.marginBottom = "10px";
              const title = document.createElement("div");
              title.textContent =
                file.name +
                " (" +
                file.type +
                ", " +
                Math.round(file.size / 1024) +
                " KB)";
              title.style.fontWeight = "600";
              wrap.appendChild(title);
  
              if (file.type.startsWith("image/")) {
                const img = document.createElement("img");
                img.style.maxWidth = "100%";
                img.style.maxHeight = "240px";
                const reader = new FileReader();
                reader.onload = (e) => {
                  img.src = e.target.result;
                };
                reader.readAsDataURL(file);
                wrap.appendChild(img);
              } else {
                const pre = document.createElement("pre");
                pre.style.maxHeight = "240px";
                pre.style.overflow = "auto";
                const reader = new FileReader();
                reader.onload = (e) => {
                  const text = String(e.target.result).slice(0, 2000);
                  pre.textContent =
                    text +
                    (e.target.result.length > 2000 ? "\n\n...truncated..." : "");
                };
                reader.readAsText(file);
                wrap.appendChild(pre);
              }
  
              toolArea.appendChild(wrap);
            });
          }
  
          fileInput.addEventListener("change", (e) => {
            if (e.target.files && e.target.files.length)
              showPreview(e.target.files);
          });
          const hdrBtn =
            panel.node && panel.node.querySelector
              ? panel.node.querySelector("#hdr-browse")
              : null;
          const cbBtn = document.getElementById("cb-browse");
          if (hdrBtn) hdrBtn.addEventListener("click", () => fileInput.click());
          if (cbBtn) cbBtn.addEventListener("click", () => fileInput.click());
        })(toolsPanel);
  
        // Button handlers
        document.getElementById("btn-dialog").addEventListener("click", () => {
          if (jsPanel.dialog && jsPanel.dialog.alert) {
            jsPanel.dialog.alert({
              position: "center",
              headerTitle: "Dialog from Tools Panel",
              content: "<p>This is a dialog opened from inside the panel.</p>",
              autoclose: false,
            });
          } else alert("Dialog extension not loaded");
        });
  
        document.getElementById("btn-spawn").addEventListener("click", () => {
          const container = document.getElementById("tool-area");
          jsPanel.create({
            container: container,
            headerTitle: "Child Panel",
            contentSize: "320 180",
            position: "center-top",
            theme: "default",
            draggable: { handle: ".jsPanel-hdr" },
            content:
              '<div style="padding:8px">This panel was spawned into the parent panel. You can drag and resize it.</div>',
          });
        });
  
        document.getElementById("btn-iframe").addEventListener("click", () => {
          const area = document.getElementById("tool-area");
          area.innerHTML =
            '<iframe src="../template_standard.html" style="width:100%;height:100%;border:0"></iframe>';
        });
  
        document.getElementById("btn-tooltip").addEventListener("click", (e) => {
          if (jsPanel.tooltip)
            jsPanel.tooltip.attach(e.target, {
              content: "Tooltip from jsPanel.tooltip",
              position: "top",
            });
          else e.target.title = "Tooltip (extension missing)";
        });
  
        // snippets area (append buttons into snippets container)
        const snippetsSection = document.createElement("div");
        snippetsSection.style.padding = "12px";
        snippetsSection.style.borderBottom = "1px solid #00ff41";
        snippetsSection.style.display = "flex";
        snippetsSection.style.gap = "8px";
        snippetsSection.style.flexWrap = "wrap";
        snippetsSection.style.overflowX = "auto";
        const contentEl =
          toolsPanel.content.querySelector("#consoleContent") ||
          toolsPanel.content;
        contentEl.insertBefore(snippetsSection, contentEl.firstChild);
  
        function createSnippetButton(label, code) {
          const btn = document.createElement("button");
          btn.textContent = label;
          Object.assign(btn.style, {
            background: "linear-gradient(135deg, #003300, #006600)",
            border: "1px solid #00ff41",
            color: "#00ff41",
            padding: "8px 16px",
            borderRadius: "4px",
            fontWeight: "bold",
            cursor: "pointer",
          });
          btn.addEventListener("click", () => {
            const inputEl = document.querySelector("#stm-input");
            if (inputEl) {
              inputEl.value = code;
              inputEl.focus();
              inputEl.select();
            }
          });
          snippetsSection.appendChild(btn);
        }
  
        createSnippetButton("Snippet 1", `console.log('Hello from Snippet 1');`);
        createSnippetButton("Snippet 2", `alert('This is Snippet 2');`);
  
        // eruda helper snippets (do not auto-run)
        createSnippetButton(
          "eruda: init",
          `if(window.eruda){ eruda.init(); } else { console.warn('eruda not present'); }`
        );
        createSnippetButton(
          "eruda: show console",
          `if(window.eruda){ const c = (eruda.get && eruda.get('console')); if(c && c.show) c.show(); else console.warn('eruda console API not available'); } else console.warn('eruda not present');`
        );
        createSnippetButton(
          "eruda: toggle",
          `if(window.eruda){ if(eruda.toggle) eruda.toggle(); else console.warn('eruda.toggle not available'); } else console.warn('eruda not present');`
        );
        createSnippetButton(
          "eruda: destroy",
          `if(window.eruda){ if(eruda.destroy) eruda.destroy(); else console.warn('eruda.destroy not available'); } else console.warn('eruda not present');`
        );
      } catch (err) {
        console.debug("initToolsPanelDemo failed", err);
      }
    };
  })();
  