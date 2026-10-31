-- Compact, non-floating tables that can sit inside the rulebook's two columns.
-- The Markdown source remains the editable content; no longtable in multicol.
function Table(t)
  local count = #t.colspecs
  local widths = {}
  local lastHeader = t.head.rows[1] and t.head.rows[1].cells[count]
  local heading = lastHeader and pandoc.utils.stringify(lastHeader.contents) or ""
  local first = count == 2 and (heading:find("Cost") or heading:find("Supply")) and .76 or .42
  for i = 1, count do
    local w = count == 1 and 1 or .95 * (i == 1 and first or (1 - first) / (count - 1))
    widths[i] = string.format('>{\\raggedright\\arraybackslash}p{%.4f\\linewidth}', w)
  end
  local function cell(c)
    return (pandoc.write(pandoc.Pandoc(c.contents), 'latex'):gsub('\n\n', '\\par '):gsub('\n$', ''))
  end
  local function row(r)
    local cells = {}
    for _, c in ipairs(r.cells) do table.insert(cells, cell(c)) end
    return table.concat(cells, ' & ') .. ' \\\\'
  end
  local out = {'\\par\\smallskip\\noindent\\begin{minipage}{\\linewidth}',
    '\\fontsize{8.4}{9.5}\\selectfont\\setlength{\\tabcolsep}{0pt}\\renewcommand{\\arraystretch}{1.15}',
    '\\begin{tabular}{@{}' .. table.concat(widths, '@{\\hspace{3pt}}') .. '@{}}\\toprule'}
  for _, r in ipairs(t.head.rows) do table.insert(out, row(r)) end
  table.insert(out, '\\midrule')
  for _, body in ipairs(t.bodies) do
    for _, r in ipairs(body.head) do table.insert(out, row(r)) end
    for _, r in ipairs(body.body) do table.insert(out, row(r)) end
  end
  for _, r in ipairs(t.foot.rows) do table.insert(out, row(r)) end
  table.insert(out, '\\bottomrule\\end{tabular}\\end{minipage}\\par\\smallskip')
  return pandoc.RawBlock('latex', table.concat(out, '\n'))
end

-- Source paths must wrap within a column rather than overprint adjacent text.
function Code(c)
  if c.text:find("/") then return pandoc.RawInline("latex", "\\path{" .. c.text .. "}") end
end
