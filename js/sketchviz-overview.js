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

  const insights = details.append("ul").classed("insights", true);
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
    .classed("differences p-0.5 bg-white text-xs", true)
    .html((d) => d.differences);
};

const renderFooter = (titleBlock) => {
  titleBlock.append("div").attr("class", "bg-slate-500 py-0.5");
};

const renderPreview = (titleBlock) => {
  // render the actual sketches
  titleBlock
    .append("div")
    .classed("h-48 overflow-clip", true)
    .append("a")
    .classed("block transition-all duration-200 hover:cursor-pointer hover:opacity-50 hover:scale-110", true)
    .attr("href", d => `flatlist.html?q=${d.title}`)
    .html((d, i) => {
      return `<img src="static/preview/${d.files.png}" class="w-full" id="sketch_${i}" />`;
    });
};

const renderDetailLink = (titleBlock) => {
  titleBlock
    .append("h3")
    .attr("class", "text-xxs uppercase p-0.5 pt-1 border-t")
    .html(
      (d) =>
        `<a href="flatlist.html?q=${d.title}" class="text-blue-600 underline underline-offset-2 text-xxs px-0.5">Detail view &rarr;</a>`
    );
};

const renderTitleBlock = (sketches) => {
  const titleBlock = sketches
    .append("div")
    .attr(
      "class",
      "titleblock transition-all shadow-none duration-200 shadow-xl w-full sm:w-56 border font-[Roboto]"
    );

  renderPreview(titleBlock);
  renderTitle(titleBlock);
  renderDetails(titleBlock);
  renderDetailLink(titleBlock);
  renderFooter(titleBlock);
};

const setupOverview = (container) => {
  fetch("./all_sketches.json")
    .then((res) => res.json())
    .then((data) => {
      d3.shuffle(data);

      const sketches = d3
        .select(container)
        .classed("flex flex-wrap sm:flex-nowrap gap-2", true)
        .selectAll("div.sketch")
        .data(data)
        .enter()
        .append("div")
        .classed("sketch", true)
        .classed("relative", true);

      // render the title blocks (with title, description, keywords, etc)
      renderTitleBlock(sketches);
    });
};

export default setupOverview;
