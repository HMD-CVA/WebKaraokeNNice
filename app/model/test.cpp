#include <iostream>
#include <vector>
#include <set>
#include <string>
#include <map>

using namespace std;

// Cấu trúc biểu diễn một luật
struct Rule {
    string name;
    set<string> prerequisites;  // Điều kiện cần
    set<string> products;       // Sản phẩm tạo ra
};

class ChemicalProductionSystem {
private:
    set<string> facts;           // Tập sự kiện hiện có
    vector<Rule> rules;          // Tập luật
    set<string> goals;           // Tập mục tiêu
    set<string> appliedRules;    // Tập luật đã áp dụng
    
public:
    ChemicalProductionSystem(set<string> initialFacts, set<string> targetGoals) {
        facts = initialFacts;
        goals = targetGoals;
        initializeRules();
    }
    
    void initializeRules() {
        // Khởi tạo các luật theo thiết kế
        rules = {
            {"L1", {"NaCl", "H2O"}, {"Cl2", "H2", "NaOH"}},
            {"L2", {"Cl2", "H2"}, {"HCl"}},
            {"L3", {"H2O"}, {"H2", "O2"}},
            {"L4", {"S", "O2"}, {"SO2"}},
            {"L5", {"SO2", "O2"}, {"SO3"}},
            {"L6", {"SO3", "H2O"}, {"H2SO4"}},
            {"L7", {"NaOH", "H2SO4"}, {"Na2SO4"}},
            {"L8", {"NaCl"}, {"Na", "Cl2"}}
        };
    }
    
    bool allGoalsAchieved() {
        for (string goal : goals) {
            if (facts.find(goal) == facts.end()) {
                return false;
            }
        }
        return true;
    }
    
    void forwardChaining() {
        cout << "=== BẮT ĐẦU SUY DIỄN TIẾN ===" << endl;
        cout << "Facts ban đầu: ";
        printFacts();
        cout << "Mục tiêu: ";
        printGoals();
        cout << endl;
        
        bool changed;
        int iteration = 0;
        
        do {
            changed = false;
            iteration++;
            cout << "--- Lần lặp " << iteration << " ---" << endl;
            
            for (Rule rule : rules) {
                // Kiểm tra nếu luật chưa được áp dụng
                if (appliedRules.find(rule.name) == appliedRules.end()) {
                    
                    // Kiểm tra điều kiện áp dụng
                    bool canApply = true;
                    for (const string& prereq : rule.prerequisites) {
                        if (facts.find(prereq) == facts.end()) {
                            canApply = false;
                            break;
                        }
                    }
                    
                    if (canApply) {
                        // Áp dụng luật và thêm sản phẩm
                        bool addedNewFact = false;
                        for (string product : rule.products) {
                            if (facts.find(product) == facts.end()) {
                                facts.insert(product);
                                addedNewFact = true;
                            }
                        }
                        
                        if (addedNewFact) {
                            appliedRules.insert(rule.name);
                            changed = true;
                            
                            cout << "Áp dụng " << rule.name << ": ";
                            printRule(rule);
                            cout << "Tập facts mới: ";
                            printFacts();
                            
                            // Kiểm tra mục tiêu
                            if (allGoalsAchieved()) {
                                cout << "\n ĐÃ ĐẠT TẤT CẢ MỤC TIÊU!" << endl;
                                return;
                            }
                        }
                    }
                }
            }
            
        } while (changed && iteration < 20); // Giới hạn số lần lặp
        
        if (!allGoalsAchieved()) {
            cout << "\n KHÔNG THỂ ĐẠT TẤT CẢ MỤC TIÊU!" << endl;
        }
    }
    
    void printFacts() {
        cout << "{ ";
        for (string fact : facts) {
            cout << fact << " ";
        }
        cout << "}" << endl << endl;
    }
    
    void printGoals() {
        cout << "{ ";
        for (string goal : goals) {
            cout << goal << " ";
        }
        cout << "}" << endl;
    }
    
    void printRule(Rule rule) {
        cout << "IF ";
        for (auto it = rule.prerequisites.begin(); it != rule.prerequisites.end(); ++it) {
            if (it != rule.prerequisites.begin()) cout << " ∧ ";
            cout << *it;
        }
        cout << " THEN ";
        for (auto it = rule.products.begin(); it != rule.products.end(); ++it) {
            if (it != rule.products.begin()) cout << " ∧ ";
            cout << *it;
        }
        cout << endl;
    }
    
    void printFinalReport() {
        cout << "\n=== BÁO CÁO CUỐI CÙNG ===" << endl;
        cout << "Số luật đã áp dụng: " << appliedRules.size() << endl;
        cout << "Tập facts cuối cùng: ";
        printFacts();
        
        cout << "\nTRẠNG THÁI MỤC TIÊU:" << endl;
        for (string goal : goals) {
            if (facts.find(goal) != facts.end()) {
                cout << goal << ": ĐẠT" << endl;
            } else {
                cout << goal << ": CHƯA ĐẠT" << endl;
            }
        }
        
        cout << "\nCÁC LUẬT ĐÃ ÁP DỤNG:" << endl;
        for (string ruleName : appliedRules) {
            cout << "  - " << ruleName << endl;
        }
    }
};

signed main() {
    // Chất ban đầu
    set<string> initialFacts = {"S", "H2O", "NaCl"};
    
    // Chất mục tiêu  
    set<string> targetGoals = {"Na2SO4", "H2SO4", "HCl", "Na"};
    
    // Khởi tạo hệ thống
    ChemicalProductionSystem system(initialFacts, targetGoals);
    
    // Thực hiện suy diễn tiến
    system.forwardChaining();
    
    // In báo cáo cuối cùng
    system.printFinalReport();
    
    return 0;
}