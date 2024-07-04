var svgs = [];

const renderTitle = (titleBlock) => {
  const header = titleBlock
    .append("div")
    .classed(
      "header flex justify-between items-center bg-white hover:cursor-pointer hover:bg-slate-50",
      true
    );

  header
    .append("h1")
    .classed("text-xs px-0.5 border-t text-gray-700 font-bold", true)
    .text((d) => d.title);

  header
    .append("span")
    .html((d) => `<span class="text-xs text-gray-300 block mr-1">🆇</span>`);

  header
    .on("mouseover", (e, d) => {
      const ref_title_block = e.target
        .closest(".titleblock")
        .querySelector(".details");
      ref_title_block.classList.add("opacity-30");
    })
    .on("mouseout", (e, d) => {
      const ref_title_block = e.target
        .closest(".titleblock")
        .querySelector(".details");
      ref_title_block.classList.remove("opacity-30");
    })
    .on("click", (e, d) => {
      const ref_title_block = e.target
        .closest(".titleblock")
        .querySelector(".details");
      ref_title_block.classList.toggle("hidden");
    });
};

const toggleSection = (el, target_selector) => {
  const ref_title_block = el.closest(".titleblock");
  const ref_keywords = ref_title_block.querySelector(target_selector);
  ref_keywords.classList.toggle("hidden");
  el.classList.toggle("visible");
};

const renderDetails = (titleBlock) => {
  const details = titleBlock.append("div").classed("details bg-slate-50", true);

  // Description
  details
    .append("h3")
    .attr("class", "visible text-xxs uppercase p-0.5 pt-1 border-t")
    .html("Description")
    .on("click", (e, d) => {
      toggleSection(e.target, ".description");
    });

  details
    .append("div")
    .attr("class", "description text-xs p-0.5")
    .html((d) => d["description"]);

  // Keywords
  details
    .append("h3")
    .attr("class", "visible text-xxs uppercase p-0.5 pt-1 border-t")
    .html("Keywords")
    .on("click", (e, d) => {
      toggleSection(e.target, ".keywords");
    });

  details
    .append("div")
    .attr("class", "keywords gap-1 p-0.5 bg-white")
    .html((d) => d["keywords"].map((k) => `<span>${k}</span>`).join(""));

  // Insights
  details
    .append("h3")
    .attr("class", "text-xxs uppercase p-0.5 pt-1 border-t")
    .html("Insights")
    .on("click", (e, d) => {
      toggleSection(e.target, ".insights");
    });

  const insights = details.append("ul").classed("insights hidden", true);
  insights
    .selectAll("li")
    .data((d) => d.insights)
    .enter()
    .append("li")
    .classed("text-xs p-0.5 bg-orange-50 mb-0.5", true)
    .html((d) => d);

  // Differences
  details
    .append("h3")
    .attr("class", "text-xxs uppercase p-0.5 pt-1 border-t")
    .html("Reality check")
    .on("click", (e, d) => {
      toggleSection(e.target, ".differences");
    });
  const differences = details
    .append("div")
    .classed("differences hidden p-0.5 bg-white text-xs", true)
    .html((d) => d.differences);
};

const renderFooter = (titleBlock) => {
  titleBlock.append("div").attr("class", "bg-slate-500 py-0.5");
};

const renderTitleBlock = (sketches) => {
  const titleBlock = sketches
    .append("div")
    .attr(
      "class",
      "titleblock transition-all shadow-none duration-200 hover:z-50 hover:shadow-xl hover:scale-105 absolute top-4 right-8 w-56 border font-[Roboto]"
    );

  renderTitle(titleBlock);
  renderDetails(titleBlock);
  renderFooter(titleBlock);
};

const setupSetches = (container, q) => {
  fetch("./all_sketches.json")
    .then((res) => res.json())
    .then((data) => {
      const filteredData = !q
        ? data
        : data.filter((d) => {
            const cleaned_q = q.toLowerCase().replace(/[^a-z0-9]/g, "");
            const corpus = [d.title, d.description, d.keywords.join(" ")]
              .join(" ")
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "");
            return corpus.includes(cleaned_q);
          });

      const sketches = d3
        .select(container)
        .selectAll("div.sketch")
        .data(filteredData)
        .enter()
        .append("div")
        .classed("sketch", true)
        .classed("relative border-y-4 bg-gray-50", true);

      // render the actual sketches
      sketches
        .append("div")
        .classed("max-h-[150vh] overflow-clip", true)
        .html((d, i) => {
          // if it's a svg, render object. Otherwise render as img
          const source_mime_type = d.files.source_mime_type || "image/svg+xml";
          if (source_mime_type === "image/svg+xml") {
            return `<object data="static/${d.files.svg}" type="image/svg+xml" class="w-screen h-screen" id="sketch_${i}"></object>`;
          } else {
            return `<img src="static/${d.files.png}" class="w-screen" id="sketch_${i}" />`;
          }
        });

      // render the title blocks (with title, description, keywords, etc)
      renderTitleBlock(sketches);

      window.setTimeout(() => {
        document.querySelectorAll(".sketch object").forEach((el) => {
          const z = svgPanZoom("#" + el.id, {
            zoomEnabled: true,
            controlIconsEnabled: true,
            fit: true,
            contain: true,
            center: true,
            minZoom: 1,
          });
          svgs.push(z);
        });
      }, 100);

      window.addEventListener("resize", function () {
        svgs.forEach((z) => {
          z.resize();
          // z.fit();
          z.center();
        });
      });
    });
};

export default setupSetches;
